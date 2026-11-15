// RYMEC Email Notification Service
// Connected to official Gmail SMTP Gateway (rymec.ismart12@gmail.com)

const nodemailer = require('nodemailer');

let transporter = null;
const devEmailOutbox = [];

function initEmailTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'rymec.ismart12@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || 'ofmjheywujdzmvdb';
  const host = process.env.SMTP_HOST;

  if (user && pass) {
    try {
      if (host) {
        transporter = nodemailer.createTransport({
          host,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });
      } else {
        // Official Gmail SMTP service preset
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass }
        });
      }
      console.log('✅ Real Gmail SMTP transporter active for:', user);
    } catch (e) {
      console.error('Failed to init Gmail transporter:', e.message);
      transporter = null;
    }
  } else {
    console.log('ℹ️ Running Email Service in simulated mode.');
  }
}

initEmailTransporter();

async function sendEmailNotification({ to, subject, html, plainText, complaintNumber, eventType }) {
  const senderUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'rymec.ismart12@gmail.com';
  const mailOptions = {
    from: process.env.SMTP_FROM || `"RYMEC Grievance Desk" <${senderUser}>`,
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
      console.log(`📧 [Real Gmail Sent] to ${to}: ${info.messageId}`);
      return { success: true, mode: 'smtp', emailSent: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`⚠️ [Gmail SMTP Failed, falling back to outbox]: ${err.message}`);
      return { success: true, mode: 'dev-fallback', emailSent: false, error: err.message };
    }
  } else {
    console.log(`📬 [Outbox] To: ${to} | Subject: ${mailOptions.subject}`);
    return { success: true, mode: 'simulated', emailSent: false, outboxId: logEntry.id };
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
