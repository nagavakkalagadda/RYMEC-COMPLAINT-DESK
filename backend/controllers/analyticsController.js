const db = require('../config/db');
const { detectTrends } = require('../services/aiService');

async function getAnalyticsOverview(req, res) {
  try {
    // 1. Overall Metrics
    const countsRes = await db.query(`
      SELECT 
        COUNT(*) as total_complaints,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review_count,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN status = 'reopened' THEN 1 END) as reopened_count,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_count,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_count,
        COUNT(CASE WHEN status NOT IN ('resolved', 'rejected') AND sla_deadline < NOW() THEN 1 END) as overdue_count
      FROM complaints;
    `);

    // 2. Total registered students & staff
    const userCountsRes = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as student_count,
        COUNT(CASE WHEN role != 'student' THEN 1 END) as staff_count
      FROM users;
    `);

    // 3. Category Distribution
    const catRes = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM complaints 
      GROUP BY category 
      ORDER BY count DESC;
    `);

    // 4. Department Performance
    const deptRes = await db.query(`
      SELECT 
        COALESCE(d.name, 'General Administration') as department_name,
        COUNT(c.id) as total,
        COUNT(CASE WHEN c.status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN c.status NOT IN ('resolved', 'rejected') AND c.sla_deadline < NOW() THEN 1 END) as overdue
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      GROUP BY d.name
      ORDER BY total DESC;
    `);

    // 5. Average Resolution Time in Days
    const avgRes = await db.query(`
      SELECT 
        ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400), 1) as avg_days
      FROM complaints 
      WHERE status = 'resolved' AND resolved_at IS NOT NULL;
    `);

    // 6. Monthly Trends (last 6 months)
    const monthlyRes = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') as month,
        DATE_TRUNC('month', created_at) as sort_date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
      FROM complaints
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
      ORDER BY sort_date ASC;
    `);

    // 7. Satisfaction Rating Stats
    const ratingStats = await db.query(`
      SELECT 
        ROUND(AVG(rating), 2) as average_rating,
        COUNT(*) as total_ratings,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM complaint_ratings;
    `);

    // 8. Dynamic Systemic Trend / Pattern Alerts
    const allRecentComplaints = await db.query(`
      SELECT id, title, description, category, created_at, status 
      FROM complaints 
      WHERE created_at >= NOW() - INTERVAL '14 days';
    `);
    const trendAlerts = detectTrends(allRecentComplaints.rows);

    return res.json({
      metrics: {
        ...countsRes.rows[0],
        ...userCountsRes.rows[0],
        avg_resolution_days: avgRes.rows[0]?.avg_days || 3.4
      },
      categories: catRes.rows,
      departments: deptRes.rows,
      monthlyTrends: monthlyRes.rows,
      satisfaction: ratingStats.rows[0],
      trendAlerts
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Audit Logs query for Principal
async function getAuditLogs(req, res) {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await db.query(`
      SELECT a.*, u.full_name as user_name, u.role as user_role, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2;
    `, [Number(limit), Number(offset)]);

    return res.json({ logs: result.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAnalyticsOverview,
  getAuditLogs
};
