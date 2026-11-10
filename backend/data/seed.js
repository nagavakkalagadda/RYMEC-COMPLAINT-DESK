const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  console.log('🌱 Starting RYMEC Grievance Desk Database Seeding...');

  try {
    // 1. Seed Departments
    const departments = [
      { name: 'Computer Science & Engineering', code: 'CSE', cat: 'academic', email: 'hod.cse@rymec.edu.in', desc: 'Department of Computer Science & Engineering' },
      { name: 'Information Science & Engineering', code: 'ISE', cat: 'academic', email: 'hod.ise@rymec.edu.in', desc: 'Department of Information Science & Engineering' },
      { name: 'Artificial Intelligence & Machine Learning', code: 'AIML', cat: 'academic', email: 'hod.aiml@rymec.edu.in', desc: 'Department of AI & Machine Learning' },
      { name: 'Hostel & Residential Facilities', code: 'HOSTEL', cat: 'hostel', email: 'warden@rymec.edu.in', desc: 'Boys and Girls Hostel Administration' },
      { name: 'Internal Complaints Committee (Anti-Ragging/Safety)', code: 'ICC', cat: 'harassment', email: 'icc.chair@rymec.edu.in', desc: 'Anti-Ragging and Women Safety Grievances' },
      { name: 'Examination & Registrar Office', code: 'EXAM', cat: 'admin', email: 'registrar@rymec.edu.in', desc: 'Certificates, Hall Tickets, Fee and Student Records' },
      { name: 'Student Welfare & Mentorship', code: 'MENTOR', cat: 'other', email: 'welfare@rymec.edu.in', desc: 'Counseling, Sports, Library and Campus Facilities' }
    ];

    for (const d of departments) {
      await db.query(`
        INSERT INTO departments (name, code, category_mapping, contact_email, description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code) DO NOTHING;
      `, [d.name, d.code, d.cat, d.email, d.desc]).catch(() => {});
    }
    console.log('✅ Departments seeded');

    // 2. Seed Users for All 6 Roles (password: password123)
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('password123', salt);

    const users = [
      {
        name: 'Rahul Sharma',
        email: 'student.rahul@rymec.edu.in',
        role: 'student',
        usn: '3BR21CS045',
        dept: 'Computer Science & Engineering',
        year: 'Final Year (2025-2026)',
        hostel: 'Aryabhata Block-B Room 304'
      },
      {
        name: 'Prof. Anita Deshmukh',
        email: 'lecturer.anita@rymec.edu.in',
        role: 'lecturer',
        dept: 'Computer Science & Engineering',
        designation: 'Assistant Professor'
      },
      {
        name: 'Dr. Mallikarjun G.',
        email: 'warden.mallikarjun@rymec.edu.in',
        role: 'warden',
        hostel: 'Aryabhata Boys Hostel Block-B',
        designation: 'Chief Hostel Warden'
      },
      {
        name: 'Dr. Veerendra Kumar',
        email: 'hod.cse@rymec.edu.in',
        role: 'hod',
        dept: 'Computer Science & Engineering',
        designation: 'Professor & Head of Department'
      },
      {
        name: 'Dr. Priya Kulkarni',
        email: 'mentor.priya@rymec.edu.in',
        role: 'mentor',
        dept: 'Student Welfare & Mentorship',
        designation: 'Senior Student Counselor & Mentor'
      },
      {
        name: 'Dr. T. Hanumantha Reddy',
        email: 'principal@rymec.edu.in',
        role: 'principal',
        designation: 'Principal & Executive Head of Institution'
      }
    ];

    const createdUsers = {};
    for (const u of users) {
      const existing = await db.query('SELECT id, role FROM users WHERE LOWER(email) = $1', [u.email.toLowerCase()]);
      if (existing.rows.length === 0) {
        const ins = await db.query(`
          INSERT INTO users (full_name, email, password_hash, role, usn_roll, department, academic_year, hostel_block, designation, is_verified)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
          RETURNING id, role;
        `, [u.name, u.email.toLowerCase(), passHash, u.role, u.usn || null, u.dept || null, u.year || null, u.hostel || null, u.designation || null]);
        createdUsers[u.role] = ins.rows[0].id;
      } else {
        createdUsers[u.role] = existing.rows[0].id;
      }
    }
    console.log('✅ Institutional Users seeded for authorized roles');
    console.log('🎉 Seeding completed (Zero mock complaints - clean database).');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0));
}

module.exports = seed;
