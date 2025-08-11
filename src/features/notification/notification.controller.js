const notificationService = require('./notification.service');

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getNotifications(req.user.userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { notificationId } = req.params;
    // Correctly receive the single notification object from the service
    const notification = await notificationService.markAsRead(notificationId);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    next(err);
  }
}

async function createNotification(req, res, next) {
  try {
    const notification = await notificationService.createNotification(req.user.userId, req.body);
    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const { notificationId } = req.params;
    const result = await notificationService.deleteNotification(notificationId);
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markAsRead, createNotification, deleteNotification };