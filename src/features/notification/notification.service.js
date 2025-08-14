const Notification = require('../../db/Notification');
const socketService = require('../../services/socket');

async function getNotifications(userId) {
  try {
    return await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'type',
        'title',
        'message',
        'read',
        'createdAt',
        'eventId',
        'deadline',
      ],
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
}

async function markAsRead(notificationId) {
  try {
    const [_, [updatedNotification]] = await Notification.update(
      { read: true },
      {
        where: { id: notificationId },
        returning: true,
      },
    );
    return updatedNotification;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

async function createNotification(userId, data) {
  try {
    const notification = await Notification.create({
      userId,
      type: data.type || 'INFO',
      title: data.title,
      message: data.message,
      eventId: data.eventId,
      deadline: data.deadline,
      read: false,
    });

    try {
      socketService.emitToUser(userId, 'notification', notification);
    } catch (socketError) {
      console.error('Failed to send socket notification:', socketError);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

async function deleteNotification(notificationId) {
  return Notification.destroy({
    where: { id: notificationId },
  });
}

async function deleteNotificationByEventId(userId, eventId, type) {
  return Notification.destroy({
    where: {
      userId,
      eventId,
      type,
    },
  });
}

module.exports = {
  getNotifications,
  markAsRead,
  createNotification,
  deleteNotification,
  deleteNotificationByEventId,
};
