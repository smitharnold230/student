const Profile = require('../../db/Profile');
const { getPointRules } = require('./utils/pointRules');
const { calculateActivityPoints } = require('./utils/activityCalculators');
const { getPointRecord, upsertPoint, getAllUsersWithPointsAndProfile } = require('./utils/pointDb');
const { sendPointUpdateNotification, sendPointResetNotification } = require('./utils/pointNotifications');

/**
 * Calculate points for a specific user based on their activities,
 * returning activity-based points and current manual adjustment separately.
 */
async function calculateUserPoints(userId) {
  try {
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      throw new Error('Profile not found');
    }

    const { activityBasedPoints, breakdown } = await calculateActivityPoints(profile.id, userId);
    const currentPointRecord = await getPointRecord(profile.id);
    const manualAdjustment = currentPointRecord?.manualAdjustment || 0;
    
    const totalPoints = activityBasedPoints + manualAdjustment;

    return {
      totalPoints, // Total points including manual adjustment
      activityBasedPoints, // Points from activities only
      breakdown,
      profileId: profile.id,
      manualAdjustment // Current manual adjustment from DB
    };
  } catch (error) {
    console.error('Error calculating user points:', error);
    throw error;
  }
}

/**
 * Update points for a specific user based on activities.
 * This function should preserve manual adjustments.
 */
async function updateUserPoints(userId) {
  try {
    const { profileId, activityBasedPoints, manualAdjustment } = await calculateUserPoints(userId);
    const newTotalPoints = activityBasedPoints + manualAdjustment;

    const pointRecord = await upsertPoint(profileId, newTotalPoints, manualAdjustment);

    return {
      totalPoints: newTotalPoints,
      activityBasedPoints,
      manualAdjustment,
      pointRecord
    };
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
}

/**
 * Update points for all users
 */
async function updateAllUserPoints() {
  try {
    const profiles = await Profile.findAll();
    const results = [];

    for (const profile of profiles) {
      try {
        const result = await updateUserPoints(profile.userId);
        results.push(result);
      } catch (error) {
        console.error(`Error updating points for user ${profile.userId}:`, error);
        results.push({ error: error.message, userId: profile.userId });
      }
    }

    return results;
  } catch (error) {
    console.error('Error updating all user points:', error);
    throw error;
  }
}

/**
 * Get point statistics for admin dashboard
 */
async function getPointStatistics() {
  try {
    const allPoints = await getAllUsersWithPointsAndProfile(); // Reusing this function to get all users with points

    const totalUsers = allPoints.length;
    const totalPoints = allPoints.reduce((sum, user) => sum + user.points, 0);
    const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

    const topPerformers = allPoints
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((user, index) => ({
        rank: index + 1,
        name: user.name,
        class: user.class,
        batch: user.batch,
        points: user.points
      }));

    return {
      totalUsers,
      totalPoints,
      averagePoints,
      topPerformers
    };
  } catch (error) {
    console.error('Error getting point statistics:', error);
    throw error;
  }
}

/**
 * Add points for a specific activity
 */
async function addPointsForActivity(userId, activityType, activityData = {}) {
  try {
    const pointRules = await getPointRules();
    const rulesMap = pointRules.reduce((acc, rule) => {
      acc[rule.key] = rule.value;
      return acc;
    }, {});

    let pointsToAdd = 0;
    let description = '';

    switch (activityType) {
      case 'WORKSHOP_PARTICIPATION':
        pointsToAdd = rulesMap.WORKSHOP_PARTICIPATION || 50;
        description = `Workshop participation: ${activityData.eventName || 'Unknown event'}`;
        break;

      case 'HACKATHON_PARTICIPATION':
        pointsToAdd = rulesMap.HACKATHON_PARTICIPATION || 100;
        description = `Hackathon participation: ${activityData.eventName || 'Unknown event'}`;
        break;

      case 'CERTIFICATION_APPROVED':
        pointsToAdd = rulesMap.CERTIFICATION_APPROVED || 75;
        description = `Certification approved: ${activityData.eventName || 'Unknown event'}`;
        break;

      case 'LEETCODE_SUBMISSION':
        pointsToAdd = rulesMap.LEETCODE_SUBMISSION || 25;
        description = `LeetCode profile submitted`;
        break;

      case 'HACKERRANK_SUBMISSION':
        pointsToAdd = rulesMap.HACKERRANK_SUBMISSION || 25;
        description = `HackerRank profile submitted`;
        break;

      default:
        throw new Error(`Unknown activity type: ${activityType}`);
    }

    // After adding points for an activity, recalculate and update the user's total points
    // This will fetch the current manual adjustment and add it to the new activity-based points.
    await updateUserPoints(userId);

    return {
      pointsAdded: pointsToAdd,
      description,
      activityType
    };
  } catch (error) {
    console.error('Error adding points for activity:', error);
    throw error;
  }
}

/**
 * Get all users with their points for admin management
 */
async function getAllUsersWithPoints() {
  return getAllUsersWithPointsAndProfile();
}

/**
 * Update points for specific users (individual or group)
 */
async function updateUserPointsManually(userIds, pointsToAdd, reason, adminId) {
  try {
    const results = [];

    for (const userId of userIds) {
      const profile = await Profile.findOne({ where: { userId } });
      if (!profile) {
        results.push({ userId, success: false, error: 'Profile not found' });
        continue;
      }

      const currentPointRecord = await getPointRecord(profile.id);
      const oldManualAdjustment = currentPointRecord?.manualAdjustment || 0;
      
      const newManualAdjustment = oldManualAdjustment + pointsToAdd;
      
      // Recalculate activity-based points
      const { activityBasedPoints } = await calculateActivityPoints(profile.id, userId);
      const newTotalPoints = activityBasedPoints + newManualAdjustment;

      await upsertPoint(profile.id, newTotalPoints, newManualAdjustment);

      await sendPointUpdateNotification(userId, pointsToAdd, reason);

      results.push({
        userId,
        success: true,
        oldPoints: currentPointRecord?.value || 0, // Use old total value for comparison
        newPoints: newTotalPoints,
        pointsChange: pointsToAdd
      });
    }

    return results;
  } catch (error) {
    console.error('Error updating user points manually:', error);
    throw error;
  }
}

/**
 * Reset points for specific users
 */
async function resetUserPoints(userIds, reason, adminId) {
  try {
    const results = [];

    for (const userId of userIds) {
      const profile = await Profile.findOne({ where: { userId } });
      if (!profile) {
        results.push({ userId, success: false, error: 'Profile not found' });
        continue;
      }

      const currentPointRecord = await getPointRecord(profile.id);
      const oldPoints = currentPointRecord?.value || 0; // Get current total points before reset

      await upsertPoint(profile.id, 0, 0); // Reset total points and manual adjustment to 0

      await sendPointResetNotification(userId, reason);

      results.push({
        userId,
        success: true,
        oldPoints,
        newPoints: 0,
        pointsChange: -oldPoints,
      });
    }

    return results;
  } catch (error) {
    console.error('Error resetting user points:', error);
    throw error;
  }
}

module.exports = {
  calculateUserPoints,
  updateUserPoints,
  updateAllUserPoints,
  getPointStatistics,
  addPointsForActivity,
  getPointRules, // Still export this for the controller
  getAllUsersWithPoints,
  updateUserPointsManually,
  resetUserPoints,
};