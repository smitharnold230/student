const pointsService = require('./points.service');

/**
 * Calculate and update points for the current user
 */
async function calculateMyPoints(req, res, next) {
  try {
    const result = await pointsService.updateUserPoints(req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get point breakdown for the current user
 */
async function getMyPointBreakdown(req, res, next) {
  try {
    const result = await pointsService.calculateUserPoints(req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get point statistics (admin only)
 */
async function getPointStatistics(req, res, next) {
  try {
    const stats = await pointsService.getPointStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update points for all users (admin only)
 */
async function updateAllUserPoints(req, res, next) {
  try {
    const results = await pointsService.updateAllUserPoints();
    res.json({
      success: true,
      message: `Updated points for ${results.length} users`,
      data: results
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get point rules
 */
async function getPointRules(req, res, next) {
  try {
    const rules = await pointsService.getPointRules();
    res.json({
      success: true,
      data: rules
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add points for a specific activity
 */
async function addPointsForActivity(req, res, next) {
  try {
    const { userId, activityType, activityData } = req.body;

    // Only admins can add points for other users
    if (userId && userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can add points for other users'
      });
    }

    const targetUserId = userId || req.user.userId;
    const result = await pointsService.addPointsForActivity(targetUserId, activityType, activityData);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all users with their points for admin management
 */
async function getAllUsersWithPoints(req, res, next) {
  try {
    const users = await pointsService.getAllUsersWithPoints();
    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update points for specific users (individual or group)
 */
async function updateUserPointsManually(req, res, next) {
  try {
    const { userIds, pointsToAdd, reason } = req.body;
    
    // These checks are now handled by the validate middleware
    // if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'User IDs array is required'
    //   });
    // }

    // if (typeof pointsToAdd !== 'number') {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Points to add must be a number'
    //   });
    // }

    // if (!reason || reason.trim() === '') {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Reason is required'
    //   });
    // }

    const results = await pointsService.updateUserPointsManually(
      userIds, 
      pointsToAdd, 
      reason, 
      req.user.userId
    );

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reset points for specific users
 */
async function resetUserPoints(req, res, next) {
  try {
    const { userIds, reason } = req.body;
    
    // These checks are now handled by the validate middleware
    // if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'User IDs array is required'
    //   });
    // }

    // if (!reason || reason.trim() === '') {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Reason is required'
    //   });
    // }

    const results = await pointsService.resetUserPoints(
      userIds, 
      reason, 
      req.user.userId
    );

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  calculateMyPoints,
  getMyPointBreakdown,
  getPointStatistics,
  updateAllUserPoints,
  getPointRules,
  addPointsForActivity,
  getAllUsersWithPoints,
  updateUserPointsManually,
  resetUserPoints
};