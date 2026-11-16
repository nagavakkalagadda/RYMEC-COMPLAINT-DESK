// ==============================================================================
// RYMEC Grievance Desk - Live Database Inspector & User Activity Tracker
// ==============================================================================
const path = require('path');
const backendDir = path.join(__dirname, '../backend');
const backendModules = path.join(backendDir, 'node_modules');

require(path.join(backendModules, 'dotenv')).config({ path: path.join(backendDir, '.env') });
const { Pool } = require(path.join(backendModules, 'pg'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  console.log('\n' + '='.repeat(85));
  console.log('🏛️  RYMEC GRIEVANCE DESK - LIVE NEON POSTGRESQL DATABASE INSPECTOR');
  console.log('='.repeat(85));
  console.log(`Endpoint: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1] : 'Unknown'}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  try {
    // 1. User Credentials and Accounts
    console.log('\n' + '-'.repeat(85));
    console.log('📋 1. REGISTERED USER CREDENTIALS & ACCOUNTS DATABASE (users table)');
    console.log('-'.repeat(85));

    const usersRes = await pool.query(`
      SELECT 
        id, 
        full_name, 
        email, 
        role, 
        usn_roll, 
        department, 
        is_verified, 
        SUBSTRING(password_hash, 1, 15) || '...' AS password_hash_preview,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as registered_at
      FROM users
      ORDER BY id ASC;
    `);

    if (usersRes.rows.length === 0) {
      console.log('No user accounts found.');
    } else {
      console.table(usersRes.rows);
      console.log(`Total registered accounts: ${usersRes.rows.length}`);
    }

    // 2. Real-Time Step-by-Step User Actions & Audit Logs
    console.log('\n' + '-'.repeat(85));
    console.log('🔍 2. LIVE STEP-BY-STEP USER ACTIVITY & FORENSIC AUDIT TRAIL (audit_logs table)');
    console.log('-'.repeat(85));

    const auditRes = await pool.query(`
      SELECT 
        a.id,
        TO_CHAR(a.created_at, 'YYYY-MM-DD HH24:MI:SS') as action_timestamp,
        COALESCE(u.full_name, 'System Engine') as actor_name,
        COALESCE(u.role, 'system') as actor_role,
        a.action as performed_step,
        a.entity_type || COALESCE(' (#' || a.entity_id || ')', '') as entity,
        COALESCE(a.ip_address, '127.0.0.1 (Campus LAN)') as user_ip,
        COALESCE(a.details->>'location', 'Ballari, KA (RYMEC)') as user_location,
        SUBSTRING(a.details::text, 1, 40) || '...' as step_details
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 25;
    `);

    if (auditRes.rows.length === 0) {
      console.log('No activity records logged yet.');
    } else {
      console.table(auditRes.rows);
      console.log(`Showing recent 25 action steps.`);
    }

    // 3. Active Grievances Summary
    console.log('\n' + '-'.repeat(85));
    console.log('📑 3. RECENT GRIEVANCE SUBMISSIONS & LIFECYCLE (complaints table)');
    console.log('-'.repeat(85));

    const complaintsRes = await pool.query(`
      SELECT 
        c.complaint_number,
        SUBSTRING(c.title, 1, 30) || '...' as title,
        c.category,
        c.priority,
        c.status,
        CASE WHEN c.is_anonymous THEN '🛡️ True Anonymous' ELSE COALESCE(u.full_name, c.student_name_snapshot) END as submitted_by,
        TO_CHAR(c.sla_deadline, 'YYYY-MM-DD HH24:MI') as sla_deadline,
        TO_CHAR(c.created_at, 'YYYY-MM-DD HH24:MI') as submitted_at
      FROM complaints c
      LEFT JOIN users u ON c.student_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 10;
    `);

    if (complaintsRes.rows.length === 0) {
      console.log('No complaints logged yet.');
    } else {
      console.table(complaintsRes.rows);
    }

    console.log('\n' + '='.repeat(85));
    console.log('💡 TIP: You can also view this in real-time on the live website by logging in as Principal');
    console.log('   at https://rymec-complaint-desk.vercel.app and navigating to "Audit Logs".');
    console.log('='.repeat(85) + '\n');

  } catch (err) {
    console.error('Database connection / inspection error:', err);
  } finally {
    await pool.end();
  }
}

inspect();
