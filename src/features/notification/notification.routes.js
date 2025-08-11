const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { getNotifications, markAsRead, createNotification, deleteNotification } = require('./notification.controller');

const router = express.Router();

router.get('/', authenticateToken, getNotifications);
router.post('/read/:notificationId', authenticateToken, markAsRead);
router.post('/', authenticateToken, createNotification);
router.delete('/:notificationId', authenticateToken, deleteNotification);

module.exports = router; 