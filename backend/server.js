const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { testConnection, query } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded grievance evidence documents & photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health & System Info
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'online',
    institution: 'Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC), Ballari',
    project: 'RYMEC Grievance Desk',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'PostgreSQL (Neon Cloud Connected)' : 'In-Memory Resilient Fallback'
  });
});

// Periodic Escalation Engine: checks every 10 minutes for SLA overdue complaints and escalates
async function runEscalationCycle() {
  try {
    const overdueRes = await query(`
      SELECT id, complaint_number, title, category, priority, sla_deadline, is_escalated, escalation_level
      FROM complaints
      WHERE status IN ('pending', 'review') 
        AND sla_deadline < NOW() 
        AND is_escalated = FALSE
      LIMIT 10;
    `);

    if (overdueRes.rows && overdueRes.rows.length > 0) {
      console.log(`⏰ [Escalation Engine] Found ${overdueRes.rows.length} overdue complaints requiring escalation.`);
      for (const item of overdueRes.rows) {
        await query(`
          UPDATE complaints 
          SET is_escalated = TRUE, 
              escalation_level = 1, 
              escalation_reason = 'Automated SLA deadline expired without closure. Auto-escalated to HOD / Central Redressal Committee.',
              updated_at = NOW()
          WHERE id = $1;
        `, [item.id]);

        await query(`
          INSERT INTO complaint_timeline (complaint_id, action_role, status, remark)
          VALUES ($1, 'system', 'escalated', 'SLA resolution deadline passed. Auto-escalated to Department Head for priority intervention.');
        `, [item.id]);
      }
    }
  } catch (err) {
    // Non-critical background task
  }
}

setInterval(runEscalationCycle, 10 * 60 * 1000);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🏛️  RYMEC GRIEVANCE DESK - BACKEND API`);
  console.log(`📍  Institution: Rao Bahadur Y. Mahabaleswarappa Engineering College`);
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`📡  API endpoints mounted at http://localhost:${PORT}/api`);
  console.log(`====================================================`);
  await testConnection();
});
