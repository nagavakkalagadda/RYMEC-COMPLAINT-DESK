const express = require('express');
const router = express.Router();
const { getAnalyticsOverview } = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get(
  '/overview',
  authenticateToken,
  requireRole(['lecturer', 'warden', 'hod', 'mentor', 'principal']),
  getAnalyticsOverview
);

module.exports = router;
