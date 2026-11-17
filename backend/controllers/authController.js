// Authentication Controller – RYMEC Grievance Desk
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { sendEmailNotification, createEmailTemplate, createProfessionalOtpTemplate } = require('../services/emailService');
const { recordAuditLog } = require('../services/auditService');

// ──────────────────────────────────────────────────────────────
// REGISTER – collects branch, section, current-studying details
// ──────────────────────────────────────────────────────────────
async function register(req, res) {
  try {
    const {
      full_name,
      email,
      password,
      role = 'student',
      usn_roll,
      department,
      academic_year,
      hostel_block,
      designation,
      branch,
      section,
      semester
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const verification_code = String(Math.floor(100000 + Math.random() * 900000));

    // Ensure branch, section, and semester columns exist in DB
    const insertSql = `
      INSERT INTO users (
        full_name, email, password_hash, role, usn_roll, department,
        academic_year, hostel_block, designation, branch, section, semester,
        is_verified, verification_code
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id, full_name, email, role, department, usn_roll, branch, section, semester, academic_year, is_verified;
    `;

    let result;
    try {
      result = await db.query(insertSql, [
        full_name.trim(),
        cleanEmail,
        password_hash,
        role,
        usn_roll || null,
        department || branch || null,
        academic_year || null,
        hostel_block || null,
        designation || null,
        branch || department || null,
        section || null,
        semester || null,
        false,
        verification_code
      ]);
    } catch (dbErr) {
      // In case columns aren't added yet, auto-add and retry
      if (dbErr.message && (dbErr.message.includes('branch') || dbErr.message.includes('section') || dbErr.message.includes('semester'))) {
        try {
          await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100);`);
          await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(100);`);
          await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS semester VARCHAR(50);`);
          result = await db.query(insertSql, [
            full_name.trim(),
            cleanEmail,
            password_hash,
            role,
            usn_roll || null,
            department || branch || null,
            academic_year || null,
            hostel_block || null,
            designation || null,
            branch || department || null,
            section || null,
            semester || null,
            false,
            verification_code
          ]);
        } catch (retryErr) {
          throw retryErr;
        }
      } else {
        throw dbErr;
      }
    }

    const user = result.rows[0];

    try {
      await recordAuditLog(req, user.id, 'USER_REGISTERED', 'user', user.id, { role: user.role, email: user.email });
    } catch (auditErr) {
      console.warn('Audit log insert warning:', auditErr.message);
    }

    // Send 6-digit OTP email template via RYMEC-iSMART Gmail Gateway
    let emailResult = { emailSent: false };
    try {
      emailResult = await sendEmailNotification({
        to: cleanEmail,
        subject: 'Your Verification Code - RYMEC-iSMART',
        eventType: 'otp',
        html: createProfessionalOtpTemplate({
          title: 'Account Verification Code',
          recipientName: full_name,
          code: verification_code,
          purposeText: 'Thank you for registering on the <strong>RYMEC-iSMART Grievance Desk</strong>. To verify your institutional credentials, enter this one-time verification code:'
        }),
        plainText: `Your RYMEC-iSMART verification code is ${verification_code}`
      });
    } catch (mailErr) {
      console.warn('Mail send error:', mailErr.message);
    }

    const emailDelivered = !!(emailResult && emailResult.emailSent);

    return res.status(201).json({
      message: 'Account created! Verification code sent to ' + cleanEmail + '. Please check your Gmail inbox or spam.',
      email: cleanEmail,
      otpSent: true,
      emailSent: emailDelivered,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
}

// ──────────────────────────────────────────────────────────────
// VERIFY OTP – validates OTP & issues JWT
// ──────────────────────────────────────────────────────────────
async function verifyOtp(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and OTP code are required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const result = await db.query(
      'SELECT id, verification_code, is_verified, role, full_name, department, usn_roll, branch, section, semester, academic_year FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      const token = jwt.sign(
        { id: user.id, email: cleanEmail, role: user.role, name: user.full_name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ message: 'Account is already verified.', token, user });
    }

    if (String(user.verification_code).trim() !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid verification OTP code. Please check and try again.' });
    }

    await db.query('UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: cleanEmail, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    try {
      await recordAuditLog(req, user.id, 'USER_VERIFIED', 'user', user.id, { email: cleanEmail });
    } catch (auditErr) {
      console.warn('Audit log insert error:', auditErr.message);
    }

    user.is_verified = true;
    return res.json({
      message: 'Email successfully verified! Welcome to RYMEC Grievance Desk.',
      token,
      user
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    return res.status(500).json({ error: 'Server error during OTP verification: ' + err.message });
  }
}

// ──────────────────────────────────────────────────────────────
// RESEND OTP – generates new code & sends email
// ──────────────────────────────────────────────────────────────
async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const cleanEmail = email.trim().toLowerCase();
    const result = await db.query('SELECT id, full_name, is_verified FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Account not found with this email' });
    const user = result.rows[0];
    if (user.is_verified) return res.status(400).json({ error: 'Account already verified. Please sign in.' });

    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    await db.query('UPDATE users SET verification_code = $1 WHERE id = $2', [newCode, user.id]);

    let emailResult = { emailSent: false };
    try {
      emailResult = await sendEmailNotification({
        to: cleanEmail,
        subject: 'New Verification Code - RYMEC-iSMART',
        eventType: 'otp',
        html: createProfessionalOtpTemplate({
          title: 'Fresh Verification Code',
          recipientName: user.full_name,
          code: newCode,
          purposeText: 'You requested a fresh verification code for the <strong>RYMEC-iSMART Grievance Desk</strong>. Please enter the one-time code below to complete your verification:'
        }),
        plainText: `Your new RYMEC-iSMART verification code is ${newCode}`
      });
    } catch (mailErr) {
      console.warn('Mail send error:', mailErr.message);
    }

    const emailDelivered = !!(emailResult && emailResult.emailSent);

    return res.json({
      message: 'A fresh verification OTP has been sent to ' + cleanEmail + '. Please check your Gmail.',
      emailSent: emailDelivered
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

// ──────────────────────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      // User hasn't verified OTP yet
      return res.status(403).json({
        error: 'Please verify your email address to continue.',
        needsVerification: true,
        email: cleanEmail
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    try {
      await recordAuditLog(req, user.id, 'USER_LOGIN', 'user', user.id, { role: user.role, email: cleanEmail });
    } catch (auditErr) {
      console.warn('Audit log error:', auditErr.message);
    }

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department,
      usn_roll: user.usn_roll,
      hostel_block: user.hostel_block,
      designation: user.designation,
      branch: user.branch || user.department,
      section: user.section,
      semester: user.semester,
      academic_year: user.academic_year,
      is_verified: user.is_verified,
      created_at: user.created_at
    };

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
}

// ──────────────────────────────────────────────────────────────
// GET ME
// ──────────────────────────────────────────────────────────────
async function getMe(req, res) {
  try {
    const result = await db.query(
      'SELECT id, full_name, email, role, department, usn_roll, hostel_block, designation, branch, section, semester, academic_year, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    if (!user.branch && user.department) {
      user.branch = user.department;
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ──────────────────────────────────────────────────────────────
// UPDATE PROFILE (Changeable Settings in User Dashboard)
// ──────────────────────────────────────────────────────────────
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { full_name, branch, section, semester, hostel_block, designation, academic_year, department } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (full_name !== undefined && full_name.trim()) {
      fields.push(`full_name = $${idx++}`);
      values.push(full_name.trim());
    }
    if (branch !== undefined) {
      fields.push(`branch = $${idx++}`);
      values.push(branch);
      // Keep department in sync for students
      if (department === undefined) {
        fields.push(`department = $${idx++}`);
        values.push(branch);
      }
    }
    if (section !== undefined) {
      fields.push(`section = $${idx++}`);
      values.push(section);
    }
    if (semester !== undefined) {
      fields.push(`semester = $${idx++}`);
      values.push(semester);
    }
    if (academic_year !== undefined) {
      fields.push(`academic_year = $${idx++}`);
      values.push(academic_year);
    }
    if (hostel_block !== undefined) {
      fields.push(`hostel_block = $${idx++}`);
      values.push(hostel_block);
    }
    if (designation !== undefined) {
      fields.push(`designation = $${idx++}`);
      values.push(designation);
    }
    if (department !== undefined) {
      fields.push(`department = $${idx++}`);
      values.push(department);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No editable profile fields provided' });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    const setClause = fields.join(', ');
    const sql = `UPDATE users SET ${setClause} WHERE id = $${idx} RETURNING id, full_name, email, role, department, usn_roll, hostel_block, designation, branch, section, semester, academic_year, is_verified, created_at`;
    values.push(userId);

    const result = await db.query(sql, values);

    try {
      await recordAuditLog(req, userId, 'USER_PROFILE_UPDATED', 'user', userId, req.body);
    } catch (auditErr) {
      console.warn('Audit log error:', auditErr.message);
    }

    return res.json({
      message: 'Profile settings updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Server error during profile update: ' + err.message });
  }
}

// ──────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ──────────────────────────────────────────────────────────────
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password does not match' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);
    await db.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, userId]);

    try {
      await recordAuditLog(req, userId, 'PASSWORD_CHANGED', 'user', userId, {});
    } catch (auditErr) {
      console.warn('Audit log error:', auditErr.message);
    }

    return res.json({ message: 'Security password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

async function getDemoAccounts(req, res) {
  return res.json({ demoAccounts: [] });
}

// ──────────────────────────────────────────────────────────────
// FORGOT PASSWORD – Request 6-digit OTP to Gmail
// ──────────────────────────────────────────────────────────────
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Registered institutional email is required' });
    }
    const cleanEmail = email.trim().toLowerCase();

    // Ensure reset columns exist in users table
    try {
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10);`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP;`);
    } catch (e) {
      // Ignored if already exist
    }

    const result = await db.query(
      'SELECT id, full_name, email FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No account registered with this email address' });
    }

    const user = result.rows[0];
    const resetCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.query(
      'UPDATE users SET reset_code = $1, reset_expires = $2 WHERE id = $3',
      [resetCode, expiresAt, user.id]
    );

    let emailResult = { emailSent: false };
    try {
      emailResult = await sendEmailNotification({
        to: cleanEmail,
        subject: 'Password Reset Verification Code - RYMEC-iSMART',
        eventType: 'password_reset_otp',
        html: createProfessionalOtpTemplate({
          title: 'Password Reset Verification Code',
          recipientName: user.full_name,
          code: resetCode,
          purposeText: 'A request was received to reset your password for the <strong>RYMEC-iSMART Grievance Desk</strong>. Enter this 6-digit verification code to authenticate your identity:'
        }),
        plainText: `Your RYMEC-iSMART password reset verification code is ${resetCode}. Valid for 10 minutes.`
      });
    } catch (mailErr) {
      console.warn('Mail send error in forgotPassword:', mailErr.message);
    }

    try {
      await recordAuditLog(req, user.id, 'PASSWORD_RESET_REQUESTED', 'user', user.id, { email: cleanEmail });
    } catch (auditErr) {}

    return res.json({
      message: 'Password reset code has been sent to ' + cleanEmail + '. Please check your Gmail inbox or spam.',
      email: cleanEmail,
      emailSent: !!(emailResult && emailResult.emailSent)
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Server error processing password reset: ' + err.message });
  }
}

// ──────────────────────────────────────────────────────────────
// VERIFY RESET OTP – Validate 6-digit code before password change
// ──────────────────────────────────────────────────────────────
async function verifyResetOtp(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and OTP code are required' });
    }
    const cleanEmail = email.trim().toLowerCase();

    const result = await db.query(
      'SELECT id, full_name, reset_code, reset_expires FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const user = result.rows[0];

    if (!user.reset_code) {
      return res.status(400).json({ error: 'No active password reset request found. Please request a new OTP.' });
    }

    if (user.reset_expires && new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({ error: 'OTP expired. Please request a new verification code.' });
    }

    if (String(user.reset_code).trim() !== String(code).trim()) {
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
    }

    return res.json({
      valid: true,
      message: 'OTP verified successfully'
    });
  } catch (err) {
    console.error('Verify reset OTP error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

// ──────────────────────────────────────────────────────────────
// RESET PASSWORD – Update password after OTP verified
// ──────────────────────────────────────────────────────────────
async function resetPassword(req, res) {
  try {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await db.query(
      'SELECT id, full_name, reset_code, reset_expires FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const user = result.rows[0];

    if (!user.reset_code || String(user.reset_code).trim() !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    if (user.reset_expires && new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new OTP.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, reset_code = NULL, reset_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHash, user.id]
    );

    // Send confirmation security notification email
    try {
      await sendEmailNotification({
        to: cleanEmail,
        subject: 'Security Alert: Password Changed Successfully - RYMEC-iSMART',
        eventType: 'password_reset_confirmed',
        html: createProfessionalOtpTemplate({
          title: 'Password Changed Successfully',
          recipientName: user.full_name,
          purposeText: 'Your account password for the <strong>RYMEC-iSMART Grievance Desk</strong> has been successfully updated. You may now sign in using your new password.',
          bodyHtml: `<p>Dear <strong>${user.full_name}</strong>,</p>
                     <p>Your password for the <strong>RYMEC-iSMART Grievance Desk</strong> was recently reset and updated.</p>
                     <div style="margin:20px 0;padding:16px;background:rgba(34,197,94,0.1);border-left:4px solid #22C55E;border-radius:6px;">
                       <p style="margin:0;color:#86EFAC;font-weight:600;">Status: Password Updated</p>
                       <p style="margin:4px 0 0;font-size:12px;color:#CBD5E1;">If this was done by you, no further action is required.</p>
                     </div>
                     <p style="font-size:12px;color:#EF4444;">If you did NOT authorize this change, please report this immediately to the RYMEC IT Cell at rymec.ismart12@gmail.com.</p>`
        }),
        plainText: `Your RYMEC-iSMART password has been reset successfully.`
      });
    } catch (e) {}

    try {
      await recordAuditLog(req, user.id, 'PASSWORD_RESET_COMPLETED', 'user', user.id, { email: cleanEmail });
    } catch (auditErr) {}

    return res.json({
      success: true,
      message: 'Password reset successful! You may now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Server error resetting password: ' + err.message });
  }
}

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  updateProfile,
  changePassword,
  getDemoAccounts,
  forgotPassword,
  verifyResetOtp,
  resetPassword
};
