const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  authenticateToken,
  optionalAuth,
  requireRole
} = require('../middleware/auth');
const {
  submitComplaint,
  trackComplaint,
  getMyComplaints,
  getAllComplaints,
  updateStatus,
  reopenComplaint,
  rateComplaint,
  getPublicResolvedFeed,
  getAttachmentById
} = require('../controllers/complaintController');

// Public endpoints
router.get('/public-feed', getPublicResolvedFeed);
router.get('/track/:complaintNumber', optionalAuth, trackComplaint);
router.get('/attachment/:id', getAttachmentById);

// Submission can be authenticated or guest (supports multiple photos or video attachments)
router.post('/submit', optionalAuth, upload.any(), submitComplaint);

// Student endpoints
router.get('/my', authenticateToken, getMyComplaints);
router.post('/:complaintId/reopen', authenticateToken, reopenComplaint);
router.post('/:complaintId/rate', authenticateToken, rateComplaint);

// Staff / Administrative endpoints
router.get(
  '/all',
  authenticateToken,
  requireRole(['lecturer', 'warden', 'hod', 'mentor', 'principal']),
  getAllComplaints
);

router.patch(
  '/:complaintId/status',
  authenticateToken,
  requireRole(['lecturer', 'warden', 'hod', 'mentor', 'principal']),
  updateStatus
);

module.exports = router;
