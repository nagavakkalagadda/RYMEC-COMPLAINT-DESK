const express = require('express');
const router = express.Router();
const { getAnalyticsOverview, getAuditLogs } = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get(
  '/overview',
  authenticateToken,
  requireRole(['lecturer', 'warden', 'hod', 'mentor', 'principal']),
  getAnalyticsOverview
);

router.get(
  '/audit-logs',
  authenticateToken,
  requireRole(['principal', 'hod']),
  getAuditLogs
);

module.exports = router;
