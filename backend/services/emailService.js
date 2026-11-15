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
    from: process.env.SMTP_FROM || `"RYMEC-iSMART" <${senderUser}>`,
    to,
    subject: `[RYMEC-iSMART] ${subject}`,
    text: plainText || 'Notification from RYMEC-iSMART Grievance Desk',
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
  return createProfessionalOtpTemplate({
    title,
    bodyHtml,
    trackingId
  });
}

// Professional High-End RYMEC-iSMART Email Template
function createProfessionalOtpTemplate({
  title = 'Institutional Verification Code',
  recipientName = 'RYMEC Student / Scholar',
  code = null,
  purposeText = 'Your one-time verification code (OTP) for account authentication:',
  bodyHtml = null,
  trackingId = null,
  expiryMinutes = 10
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #0B132B; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
        
        <!-- Header Banner -->
        <tr>
          <td style="background: linear-gradient(180deg, #15213D 0%, #0B132B 100%); padding: 28px 24px 20px; text-align: center; border-bottom: 2px solid #2563EB;">
            <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #F59E0B;">
              Veerasaiva Vidyavardhaka Sangha, Ballari
            </p>
            <h1 style="margin: 0; color: #FFFFFF; font-size: 18px; font-weight: 800; letter-spacing: 0.5px; line-height: 1.3;">
              RAO BAHADUR Y. MAHABALESWARAPPA ENGINEERING COLLEGE
            </h1>
            <div style="margin-top: 8px;">
              <span style="display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 600; color: #93C5FD; letter-spacing: 1px; text-transform: uppercase;">
                NAAC A+ Accredited · VTU Belagavi Affiliated
              </span>
            </div>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);">
              <span style="font-size: 13px; font-weight: 700; color: #38BDF8; letter-spacing: 1.5px; text-transform: uppercase;">
                RYMEC-iSMART Grievance Redressal Desk
              </span>
            </div>
          </td>
        </tr>

        <!-- Content Area -->
        <tr>
          <td style="padding: 32px 28px; background-color: #0F172A; color: #E2E8F0; font-size: 14px; line-height: 1.65;">
            
            <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #F8FAFC; border-left: 3px solid #38BDF8; padding-left: 12px;">
              ${title}
            </h2>

            ${bodyHtml ? bodyHtml : `
              <p style="margin: 0 0 12px; color: #F1F5F9; font-size: 15px;">
                Dear <strong>${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #94A3B8;">
                ${purposeText}
              </p>

              ${code ? `
                <!-- 6-Digit OTP Highlight Box -->
                <div style="margin: 28px 0; padding: 24px 16px; background: #070C18; border: 2px dashed #2563EB; border-radius: 14px; text-align: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);">
                  <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #38BDF8;">
                    Secure One-Time Password (OTP)
                  </p>
                  <div style="font-family: 'Consolas', 'Courier New', Courier, monospace; font-size: 40px; font-weight: 800; letter-spacing: 14px; color: #60A5FA; padding: 8px 0 8px 14px; text-shadow: 0 0 16px rgba(96,165,250,0.4);">
                    ${code}
                  </div>
                  <p style="margin: 8px 0 0; font-size: 11px; color: #94A3B8;">
                    ⏱️ Valid for <strong>${expiryMinutes} minutes</strong> only
                  </p>
                </div>
              ` : ''}

              <!-- Security Advisory -->
              <div style="margin: 24px 0 0; padding: 14px 16px; background: rgba(239, 68, 68, 0.08); border-left: 3px solid #EF4444; border-radius: 6px;">
                <p style="margin: 0; font-size: 12px; color: #FCA5A5; font-weight: 600;">
                  🔒 Security Notice
                </p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #CBD5E1; line-height: 1.5;">
                  Never disclose your verification code or login password to anyone. RYMEC administrators and grievance committee members will never ask for your code.
                </p>
              </div>

              <p style="margin: 20px 0 0; font-size: 12px; color: #64748B;">
                If you did not initiate this request, you can safely ignore this email or notify the IT cell immediately.
              </p>
            `}

            ${trackingId ? `
              <div style="margin: 24px 0; padding: 14px; background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38BDF8; border-radius: 6px;">
                <p style="margin: 0; font-size: 12px; color: #94A3B8; text-transform: uppercase; font-weight: bold;">Tracking Reference ID:</p>
                <p style="margin: 4px 0 0; font-family: monospace; font-size: 17px; font-weight: bold; color: #F8FAFC;">${trackingId}</p>
              </div>
            ` : ''}

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px 24px; background-color: #070C18; border-top: 1px solid #1E293B; text-align: center; color: #64748B; font-size: 11px; line-height: 1.6;">
            <p style="margin: 0; font-weight: 600; color: #94A3B8;">
              Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC)
            </p>
            <p style="margin: 3px 0 0;">
              V.V. Sangha Campus, Cantonment, Ballari — 583 104, Karnataka, India
            </p>
            <p style="margin: 6px 0 0;">
              Official Helpdesk Gateway: <a href="mailto:rymec.ismart12@gmail.com" style="color: #38BDF8; text-decoration: none;">rymec.ismart12@gmail.com</a>
            </p>
            <p style="margin: 10px 0 0; font-size: 10px; color: #475569;">
              © ${new Date().getFullYear()} RYMEC Institutional Redressal System. This is an automated security transmission.
            </p>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;
}

function getDevOutbox() {
  return devEmailOutbox;
}

module.exports = {
  sendEmailNotification,
  createEmailTemplate,
  createProfessionalOtpTemplate,
  getDevOutbox
};
