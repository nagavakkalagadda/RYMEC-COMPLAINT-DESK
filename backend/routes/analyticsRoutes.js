const express = require('express');
const router = express.Router();
const { getAnalyticsOverview, getAuditLogs } = require('../controllers/analyticsController');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');

router.get(
  '/overview',
  authenticateToken,
  requireRole(['lecturer', 'warden', 'hod', 'mentor', 'principal']),
  getAnalyticsOverview
);

router.get(
  '/audit-logs',
  optionalAuth,
  getAuditLogs
);

module.exports = router;
