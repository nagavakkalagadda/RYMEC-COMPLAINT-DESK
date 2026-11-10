const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  getEmailOutboxPreview
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getMyNotifications);
router.patch('/:id/read', authenticateToken, markAsRead);
router.get('/dev-outbox', getEmailOutboxPreview);

module.exports = router;
