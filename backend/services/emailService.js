// RYMEC Email Notification Service
// Uses Nodemailer with SMTP when configured, or transparent dev logger for viva/demo testing.

const nodemailer = require('nodemailer');

let transporter = null;
const devEmailOutbox = [];

function initEmailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('✅ Real SMTP Email transporter configured for:', process.env.SMTP_USER);
  } else {
    console.log('ℹ️  Running Email Service in Dev/Demo mode (emails logged & saved to outbox).');
  }
}

initEmailTransporter();

async function sendEmailNotification({ to, subject, html, plainText, complaintNumber, eventType }) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"RYMEC Grievance Desk" <grievance@rymec.edu.in>',
    to,
    subject: `[RYMEC Grievance] ${subject}`,
    text: plainText || 'Notification from RYMEC Grievance Desk',
    html: html || `<p>${plainText}</p>`,
  };

  const logEntry = {
    id: 'MAIL-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    to,
    subject: mailOptions.subject,
    eventType: eventType || 'general',
    complaintNumber: complaintNumber || null,
    timestamp: new Date().toISOString(),
    preview: plainText || subject
  };

  devEmailOutbox.unshift(logEntry);
  if (devEmailOutbox.length > 50) devEmailOutbox.pop();

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 [Real SMTP Sent] to ${to}: ${info.messageId}`);
      return { success: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.warn(`⚠️ [SMTP Failed, logged to outbox]: ${err.message}`);
      return { success: true, mode: 'dev-fallback', error: err.message };
    }
  } else {
    console.log(`📬 [Dev Outbox] To: ${to} | Subject: ${mailOptions.subject}`);
    return { success: true, mode: 'dev', outboxId: logEntry.id };
  }
}

// Pre-styled RYMEC email template
function createEmailTemplate(title, bodyHtml, trackingId = null) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B132B; color: #F8FAFC; border-radius: 12px; overflow: hidden; border: 1px solid #1C2541;">
      <div style="background: linear-gradient(135deg, #1C2541 0%, #0B132B 100%); padding: 24px; text-align: center; border-bottom: 2px solid #38BDF8;">
        <h2 style="margin: 0; color: #FFFFFF; font-size: 20px; letter-spacing: 0.5px;">RAO BAHADUR Y. MAHABALESWARAPPA ENGINEERING COLLEGE</h2>
        <p style="margin: 6px 0 0; color: #38BDF8; font-weight: bold; font-size: 14px;">RYMEC GRIEVANCE DESK</p>
      </div>
      <div style="padding: 28px 24px; background: #10172A; line-height: 1.6;">
        <h3 style="color: #38BDF8; margin-top: 0;">${title}</h3>
        ${bodyHtml}
        ${trackingId ? `
          <div style="margin: 24px 0; padding: 14px; background: rgba(56, 189, 248, 0.1); border-left: 4px solid #38BDF8; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #94A3B8;">Tracking Reference ID:</p>
            <p style="margin: 4px 0 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #F8FAFC;">${trackingId}</p>
          </div>
        ` : ''}
      </div>
      <div style="padding: 16px 24px; background: #0B0F19; font-size: 12px; color: #64748B; text-align: center;">
        <p style="margin: 0;">V.V. Sangha Campus, Cantonment, Ballari - 583104, Karnataka</p>
        <p style="margin: 4px 0 0;">This is an automated notification from the institutional grievance portal.</p>
      </div>
    </div>
  `;
}

function getDevOutbox() {
  return devEmailOutbox;
}

module.exports = {
  sendEmailNotification,
  createEmailTemplate,
  getDevOutbox
};
