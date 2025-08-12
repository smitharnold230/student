const Notification = require('../../../db/Notification');

/**
 * Sends a notification to a user about a point update.
 * @param {string} userId - The ID of the user to notify.
 * @param {number} pointsChange - The amount of points changed (can be negative).
 * @param {string} reason - The reason for the point change.
 */
async function sendPointUpdateNotification(userId, pointsChange, reason) {
  try {
    await Notification.create({
      userId,
      title: 'Points Updated',
      message: `Your points have been ${pointsChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(pointsChange)}. Reason: ${reason}`,
      type: 'POINTS_UPDATE',
      read: false
    });
  } catch (error) {
    console.error('Error sending point update notification:', error);
    // Fail silently, as notifications are secondary to point updates
  }
}

/**
 * Sends a notification to a user about a point reset.
 * @param {string} userId - The ID of the user to notify.
 * @param {string} reason - The reason for the point reset.
 */
async function sendPointResetNotification(userId, reason) {
  try {
    await Notification.create({
      userId,
      title: 'Points Reset',
      message: `Your points have been reset to 0. Reason: ${reason}`,
      type: 'POINTS_RESET',
      read: false
    });
  } catch (error) {
    console.error('Error sending point reset notification:', error);
    // Fail silently
  }
}

module.exports = {
  sendPointUpdateNotification,
  sendPointResetNotification,
};