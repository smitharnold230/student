const Notification = require('../../db/Notification');

async function getNotifications(userId) {
  return Notification.findAll({
    where: { userId },
    orderBy: [['createdAt', 'DESC']],
  });
}

async function markAsRead(notificationId) {
  return Notification.update(
    { read: true },
    { where: { id: notificationId }, returning: true }
  );
}

async function createNotification(userId, data) {
  return Notification.create({
    userId,
    type: data.type,
    title: data.title,
    message: data.message,
    eventId: data.eventId,
    deadline: data.deadline,
    read: false,
  });
}

async function deleteNotification(notificationId) {
  return Notification.destroy({
    where: { id: notificationId }
  });
}

async function deleteNotificationByEventId(userId, eventId, type) {
  return Notification.destroy({
    where: { 
      userId,
      eventId,
      type
    }
  });
}

module.exports = { getNotifications, markAsRead, createNotification, deleteNotification, deleteNotificationByEventId }; 