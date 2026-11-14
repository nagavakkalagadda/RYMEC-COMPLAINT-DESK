// Authentication Controller – RYMEC Grievance Desk
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { sendEmailNotification, createEmailTemplate } = require('../services/emailService');

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
      section
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

    // Ensure branch and section columns exist in DB (handled dynamically if table is older)
    const insertSql = `
      INSERT INTO users (
        full_name, email, password_hash, role, usn_roll, department,
        academic_year, hostel_block, designation, branch, section,
        is_verified, verification_code
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING id, full_name, email, role, department, usn_roll, branch, section, academic_year, is_verified;
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
        false,
        verification_code
      ]);
    } catch (dbErr) {
      // In case columns branch or section aren't added yet, auto-add and retry
      if (dbErr.message && (dbErr.message.includes('branch') || dbErr.message.includes('section'))) {
        try {
          await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100);`);
          await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(100);`);
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
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5)`,
        [user.id, 'USER_REGISTERED', 'user', String(user.id), JSON.stringify({ role: user.role, email: user.email })]
      );
    } catch (auditErr) {
      console.warn('Audit log insert warning:', auditErr.message);
    }

    // Send 6-digit OTP email template
    const emailResult = await sendEmailNotification({
      to: cleanEmail,
      subject: 'Your OTP for RYMEC Grievance Desk Registration',
      eventType: 'otp',
      html: createEmailTemplate(
        'Verify Your RYMEC Account',
        `<p>Dear <b>${full_name}</b>,</p>
         <p>Thank you for registering on the <b>RYMEC Grievance Desk</b> (Rao Bahadur Y. Mahabaleswarappa Engineering College, Ballari).</p>
         <p>Your one-time verification code (OTP) is:</p>
         <div style="margin:24px 0;padding:20px;background:rgba(56,189,248,0.12);border:2px dashed #38BDF8;border-radius:10px;text-align:center;">
           <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:bold;letter-spacing:10px;color:#38BDF8;">${verification_code}</span>
         </div>
         <p style="color:#94A3B8;font-size:13px;">This verification code is valid for 10 minutes. Please enter it in the registration dialog to verify your identity.</p>
         <p style="color:#64748B;font-size:12px;">If you did not request this registration, please disregard this email.</p>`
      ),
      plainText: `Your RYMEC Grievance Desk verification code is ${verification_code}`
    });

    return res.status(201).json({
      message: 'Account created. Please enter the OTP sent to ' + cleanEmail,
      email: cleanEmail,
      otpSent: true,
      demoOtp: process.env.NODE_ENV !== 'production' ? verification_code : undefined,
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
      'SELECT id, verification_code, is_verified, role, full_name, department, usn_roll, branch, section, academic_year FROM users WHERE LOWER(email) = $1',
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
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5)`,
        [user.id, 'USER_VERIFIED', 'user', String(user.id), JSON.stringify({ email: cleanEmail })]
      );
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

    await sendEmailNotification({
      to: cleanEmail,
      subject: 'New OTP - RYMEC Grievance Desk',
      eventType: 'otp',
      html: createEmailTemplate(
        'New Verification Code',
        `<p>Dear <b>${user.full_name}</b>,</p>
         <p>You requested a fresh verification code for the RYMEC Grievance Desk.</p>
         <div style="margin:24px 0;padding:20px;background:rgba(56,189,248,0.12);border:2px dashed #38BDF8;border-radius:10px;text-align:center;">
           <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:bold;letter-spacing:10px;color:#38BDF8;">${newCode}</span>
         </div>
         <p style="color:#94A3B8;font-size:13px;">This code is valid for 10 minutes.</p>`
      ),
      plainText: `Your new RYMEC verification code is ${newCode}`
    });

    return res.json({
      message: 'A fresh verification OTP has been sent to ' + cleanEmail,
      demoOtp: process.env.NODE_ENV !== 'production' ? newCode : undefined
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
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5)`,
        [user.id, 'USER_LOGIN', 'user', String(user.id), JSON.stringify({ role: user.role })]
      );
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
      'SELECT id, full_name, email, role, department, usn_roll, hostel_block, designation, branch, section, academic_year, is_verified, created_at FROM users WHERE id = $1',
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
    const { full_name, branch, section, hostel_block, designation, academic_year, department } = req.body;

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
    const sql = `UPDATE users SET ${setClause} WHERE id = $${idx} RETURNING id, full_name, email, role, department, usn_roll, hostel_block, designation, branch, section, academic_year, is_verified, created_at`;
    values.push(userId);

    const result = await db.query(sql, values);

    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5)`,
        [userId, 'USER_PROFILE_UPDATED', 'user', String(userId), JSON.stringify(req.body)]
      );
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
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5)`,
        [userId, 'PASSWORD_CHANGED', 'user', String(userId), JSON.stringify({})]
      );
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

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  updateProfile,
  changePassword,
  getDemoAccounts
};
