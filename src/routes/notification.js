const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

const router = express.Router();

// Get all notifications for current user
router.get('/', authenticateToken, getNotifications);

// Mark a notification as read
router.post('/read/:notificationId', authenticateToken, markAsRead);

module.exports = router; 