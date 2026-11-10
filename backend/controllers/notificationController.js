const db = require('../config/db');
const { getDevOutbox } = require('../services/emailService');

async function getMyNotifications(req, res) {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );

    const unreadCount = result.rows.filter(n => !n.is_read).length;

    return res.json({
      notifications: result.rows,
      unreadCount
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.user.id]);
    } else {
      await db.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    }
    return res.json({ message: 'Marked as read' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getEmailOutboxPreview(req, res) {
  // Returns recent triggered email notifications for viva/demo showcase
  return res.json({ outbox: getDevOutbox() });
}

module.exports = {
  getMyNotifications,
  markAsRead,
  getEmailOutboxPreview
};
