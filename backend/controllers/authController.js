// Authentication Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { sendEmailNotification, createEmailTemplate } = require('../services/emailService');

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
      designation
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const verification_code = String(Math.floor(100000 + Math.random() * 900000));

    const insertSql = `
      INSERT INTO users (
        full_name, email, password_hash, role, usn_roll, department,
        academic_year, hostel_block, designation, is_verified, verification_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, full_name, email, role, department, usn_roll, is_verified;
    `;

    const result = await db.query(insertSql, [
      full_name.trim(),
      cleanEmail,
      password_hash,
      role,
      usn_roll || null,
      department || null,
      academic_year || null,
      hostel_block || null,
      designation || null,
      true, // Auto-verified for seamless demonstration, with verification code recorded
      verification_code
    ]);

    const user = result.rows[0];

    // Log to audit trail
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, 'USER_REGISTERED', 'user', String(user.id), JSON.stringify({ role: user.role, email: user.email })]
    );

    // Send welcome notification
    await sendEmailNotification({
      to: cleanEmail,
      subject: 'Welcome to RYMEC Grievance Desk',
      eventType: 'welcome',
      html: createEmailTemplate(
        'Account Registration Successful',
        `<p>Dear <b>${full_name}</b>,</p>
         <p>Your account on <b>RYMEC Grievance Desk</b> has been created successfully as <b>${role.toUpperCase()}</b>.</p>
         <p>You can now submit grievances, track resolution timelines in real-time, and view administrative responses transparently.</p>`
      ),
      plainText: `Welcome to RYMEC Grievance Desk. Your account has been registered with role: ${role}.`
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
}

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

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit log
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, 'USER_LOGIN', 'user', String(user.id), JSON.stringify({ role: user.role })]
    );

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department,
      usn_roll: user.usn_roll,
      hostel_block: user.hostel_block,
      designation: user.designation,
      is_verified: user.is_verified
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

async function getMe(req, res) {
  try {
    const result = await db.query(
      'SELECT id, full_name, email, role, department, usn_roll, hostel_block, designation, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getDemoAccounts(req, res) {
  return res.json({ demoAccounts: [] });
}

module.exports = {
  register,
  login,
  getMe,
  getDemoAccounts
};
