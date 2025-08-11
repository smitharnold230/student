const Profile = require('../../db/Profile');
const Point = require('../../db/Point');
const PointRule = require('../../db/PointRule');
const Event = require('../../db/Event');
const EventParticipation = require('../../db/EventParticipation');
const CodingStat = require('../../db/CodingStat');
const Submission = require('../../db/Submission');

// Default point rules if none exist in database
const DEFAULT_POINT_RULES = {
  WORKSHOP_PARTICIPATION: { value: 50, description: 'Points for workshop participation' },
  HACKATHON_PARTICIPATION: { value: 100, description: 'Points for hackathon participation' },
  CERTIFICATION_APPROVED: { value: 75, description: 'Points for approved certification' },
  LEETCODE_SUBMISSION: { value: 25, description: 'Points for LeetCode submission' },
  HACKERRANK_SUBMISSION: { value: 25, description: 'Points for HackerRank submission' },
  LEETCODE_PROBLEMS_BONUS: { value: 5, description: 'Bonus points per 50 LeetCode problems solved' },
  HACKERRANK_PROBLEMS_BONUS: { value: 3, description: 'Bonus points per 50 HackerRank problems solved' },
  FIRST_WORKSHOP_BONUS: { value: 25, description: 'Bonus for first workshop participation' },
  FIRST_HACKATHON_BONUS: { value: 50, description: 'Bonus for first hackathon participation' },
  CERTIFICATION_STREAK_BONUS: { value: 20, description: 'Bonus for consecutive approved certifications' },
};

// Progression thresholds
// Removed progression thresholds - only using batches now

/**
 * Get point rules from database or use defaults
 */
async function getPointRules() {
  try {
    const rules = await PointRule.findAll();
    if (rules.length === 0) {
      // Initialize default rules if none exist
      const defaultRules = Object.entries(DEFAULT_POINT_RULES).map(([key, rule]) => ({
        key,
        value: rule.value,
        description: rule.description,
      }));
      await PointRule.bulkCreate(defaultRules);
      return defaultRules;
    }
    return rules;
  } catch (error) {
    console.error('Error getting point rules:', error);
    return Object.entries(DEFAULT_POINT_RULES).map(([key, rule]) => ({
      key,
      value: rule.value,
      description: rule.description,
    }));
  }
}

/**
 * Calculate points for a specific user based on their activities
 */
async function calculateUserPoints(userId) {
  try {
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      throw new Error('Profile not found');
    }

    const pointRules = await getPointRules();
    const rulesMap = pointRules.reduce((acc, rule) => {
      acc[rule.key] = rule.value;
      return acc;
    }, {});

    let totalPoints = 0;
    const pointBreakdown = {};

    // 1. Calculate workshop participation points
    const workshopParticipations = await EventParticipation.findAll({
      include: [{
        model: Event,
        where: { type: 'WORKSHOP' },
        attributes: ['id', 'name']
      }],
      where: { userId }
    });

    const workshopPoints = workshopParticipations.length * (rulesMap.WORKSHOP_PARTICIPATION || 50);
    totalPoints += workshopPoints;
    pointBreakdown.workshops = {
      count: workshopParticipations.length,
      points: workshopPoints,
      events: workshopParticipations.map(p => p.Event.name)
    };

    // 2. Calculate hackathon participation points
    const hackathonParticipations = await EventParticipation.findAll({
      include: [{
        model: Event,
        where: { type: 'HACKATHON' },
        attributes: ['id', 'name']
      }],
      where: { userId }
    });

    const hackathonPoints = hackathonParticipations.length * (rulesMap.HACKATHON_PARTICIPATION || 100);
    totalPoints += hackathonPoints;
    pointBreakdown.hackathons = {
      count: hackathonParticipations.length,
      points: hackathonPoints,
      events: hackathonParticipations.map(p => p.Event.name)
    };

    // 3. Calculate certification points
    const approvedCertifications = await Submission.findAll({
      where: {
        profileId: profile.id,
        status: 'APPROVED'
      },
      include: [{
        model: Event,
        attributes: ['id', 'name']
      }]
    });

    const certificationPoints = approvedCertifications.length * (rulesMap.CERTIFICATION_APPROVED || 75);
    totalPoints += certificationPoints;
    pointBreakdown.certifications = {
      count: approvedCertifications.length,
      points: certificationPoints,
      certifications: approvedCertifications.map(c => c.Event.name)
    };

    // 4. Calculate coding platform points
    const codingStats = await CodingStat.findAll({
      where: { profileId: profile.id }
    });

    let codingPoints = 0;
    const codingBreakdown = {};

    for (const stat of codingStats) {
      let platformPoints = 0;

      if (stat.platform === 'LeetCode') {
        // Base points for LeetCode submission
        platformPoints += rulesMap.LEETCODE_SUBMISSION || 25;

        // Bonus points for problems solved (5 points per 50 problems)
        const problemBonus = Math.floor(stat.problemsSolved / 50) * (rulesMap.LEETCODE_PROBLEMS_BONUS || 5);
        platformPoints += problemBonus;

        codingBreakdown.leetcode = {
          problemsSolved: stat.problemsSolved,
          basePoints: rulesMap.LEETCODE_SUBMISSION || 25,
          bonusPoints: problemBonus,
          totalPoints: platformPoints
        };
      } else if (stat.platform === 'HackerRank') {
        // Base points for HackerRank submission
        platformPoints += rulesMap.HACKERRANK_SUBMISSION || 25;

        // Bonus points for problems solved (3 points per 50 problems)
        const problemBonus = Math.floor(stat.problemsSolved / 50) * (rulesMap.HACKERRANK_PROBLEMS_BONUS || 3);
        platformPoints += problemBonus;

        codingBreakdown.hackerrank = {
          problemsSolved: stat.problemsSolved,
          basePoints: rulesMap.HACKERRANK_SUBMISSION || 25,
          bonusPoints: problemBonus,
          totalPoints: platformPoints
        };
      }

      codingPoints += platformPoints;
    }

    totalPoints += codingPoints;
    pointBreakdown.coding = {
      totalPoints: codingPoints,
      breakdown: codingBreakdown
    };

    // 5. Calculate bonus points
    let bonusPoints = 0;
    const bonusBreakdown = {};

    // First workshop bonus
    if (workshopParticipations.length === 1) {
      const firstWorkshopBonus = rulesMap.FIRST_WORKSHOP_BONUS || 25;
      bonusPoints += firstWorkshopBonus;
      bonusBreakdown.firstWorkshop = firstWorkshopBonus;
    }

    // First hackathon bonus
    if (hackathonParticipations.length === 1) {
      const firstHackathonBonus = rulesMap.FIRST_HACKATHON_BONUS || 50;
      bonusPoints += firstHackathonBonus;
      bonusBreakdown.firstHackathon = firstHackathonBonus;
    }

    // Certification streak bonus (consecutive approved certifications)
    if (approvedCertifications.length >= 2) {
      const streakBonus = rulesMap.CERTIFICATION_STREAK_BONUS || 20;
      bonusPoints += streakBonus;
      bonusBreakdown.certificationStreak = streakBonus;
    }

    totalPoints += bonusPoints;
    pointBreakdown.bonuses = {
      totalPoints: bonusPoints,
      breakdown: bonusBreakdown
    };

          // 6. Get manual adjustments (admin bonus/penalty points)
      const currentPointRecord = await Point.findOne({ where: { profileId: profile.id } });
      const manualAdjustment = currentPointRecord?.manualAdjustment || 0;
      totalPoints += manualAdjustment;

    return {
      totalPoints,
      breakdown: pointBreakdown,
      profileId: profile.id,
      manualAdjustment
    };
  } catch (error) {
    console.error('Error calculating user points:', error);
    throw error;
  }
}

/**
 * Update points for a specific user
 */
async function updateUserPoints(userId) {
  try {
    const pointCalculation = await calculateUserPoints(userId);

    // Get current manual adjustment
    const currentPointRecord = await Point.findOne({ where: { profileId: pointCalculation.profileId } });
    const currentManualAdjustment = currentPointRecord?.manualAdjustment || 0;

    // Upsert points record, preserving manual adjustments
    const [pointRecord, created] = await Point.upsert({
      profileId: pointCalculation.profileId,
      value: pointCalculation.totalPoints,
      manualAdjustment: currentManualAdjustment, // Preserve manual adjustments
    }, {
      where: { profileId: pointCalculation.profileId }
    });

    return {
      ...pointCalculation,
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
 * Get progression level based on total points
 */
// Removed progression level function - only using batches now

/**
 * Get point statistics for admin dashboard
 */
async function getPointStatistics() {
  try {
    const allPoints = await Point.findAll({
      include: [{
        model: Profile,
        attributes: ['id', 'name', 'class', 'batch']
      }]
    });

    const totalUsers = allPoints.length;
    const totalPoints = allPoints.reduce((sum, point) => sum + point.value, 0);
    const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

    // Top performers
    const topPerformers = allPoints
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((point, index) => ({
        rank: index + 1,
        name: point.Profile.name,
        class: point.Profile.class,
        batch: point.Profile.batch,
        points: point.value
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

    // Update user points
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
  try {
    const profiles = await Profile.findAll({
      include: [
        {
          model: Point,
          attributes: ['value', 'manualAdjustment']
        },
        {
          model: require('../../db/User'),
          attributes: ['id', 'email', 'role']
        }
      ],
      attributes: ['id', 'name', 'class', 'batch', 'userId']
    });

    return profiles.map(profile => ({
      id: profile.userId,
      name: profile.name,
      email: profile.User.email,
      class: profile.class,
      batch: profile.batch,
      points: profile.Point?.value || 0,
      manualAdjustment: profile.Point?.manualAdjustment || 0,
      profileId: profile.id
    }));
  } catch (error) {
    console.error('Error getting all users with points:', error);
    throw error;
  }
}

/**
 * Update points for specific users (individual or group)
 */
async function updateUserPointsManually(userIds, pointsToAdd, reason, adminId) {
  try {
    const results = [];
    const Notification = require('../../db/Notification');

    for (const userId of userIds) {
      // Get current points
      const profile = await Profile.findOne({ where: { userId } });
      if (!profile) {
        results.push({ userId, success: false, error: 'Profile not found' });
        continue;
      }

      // Get current point record
      const currentPointRecord = await Point.findOne({ where: { profileId: profile.id } });
      const currentManualAdjustment = currentPointRecord?.manualAdjustment || 0;
      
      // Calculate new manual adjustment
      const newManualAdjustment = currentManualAdjustment + pointsToAdd;
      
      // Calculate total points including the new manual adjustment
      const calculatedPoints = await calculateUserPoints(userId);
      const basePoints = calculatedPoints.totalPoints - currentManualAdjustment; // Remove old manual adjustment
      const newTotalPoints = basePoints + newManualAdjustment;

      // Update points with the new manual adjustment
      await Point.upsert({
        profileId: profile.id,
        value: newTotalPoints,
        manualAdjustment: newManualAdjustment,
      });

      // Create notification for the user
      await Notification.create({
        userId,
        title: 'Points Updated',
        message: `Your points have been ${pointsToAdd >= 0 ? 'increased' : 'decreased'} by ${Math.abs(pointsToAdd)}. Reason: ${reason}`,
        type: 'POINTS_UPDATE',
        isRead: false
      });

      results.push({
        userId,
        success: true,
        oldPoints: calculatedPoints.totalPoints,
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
    const Notification = require('../../db/Notification');

    for (const userId of userIds) {
      const profile = await Profile.findOne({ where: { userId } });
      if (!profile) {
        results.push({ userId, success: false, error: 'Profile not found' });
        continue;
      }

      // Calculate current points to get the old value
      const calculatedPoints = await calculateUserPoints(userId);
      const oldPoints = calculatedPoints.totalPoints;

      // Reset to 0 (including manual adjustments)
      await Point.upsert({
        profileId: profile.id,
        value: 0,
        manualAdjustment: 0, // Reset manual adjustments as well
      });

      // Create notification
      await Notification.create({
        userId,
        title: 'Points Reset',
        message: `Your points have been reset to 0. Reason: ${reason}`,
        type: 'POINTS_RESET',
        isRead: false
      });

      results.push({
        userId,
        success: true,
        oldPoints,
        newPoints: 0,
        pointsChange: -oldPoints,
        // Removed progression - only using batches
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
  getPointRules,
  getAllUsersWithPoints,
  updateUserPointsManually,
  resetUserPoints,
}; 