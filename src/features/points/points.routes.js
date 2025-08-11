const express = require('express');
const router = express.Router();
const pointsController = require('./points.controller');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');

// Student routes
router.get('/my-points', authenticateToken, pointsController.calculateMyPoints);
router.get('/my-breakdown', authenticateToken, pointsController.getMyPointBreakdown);
router.get('/rules', authenticateToken, pointsController.getPointRules);
router.post('/add-activity', authenticateToken, validate('points.addActivity'), pointsController.addPointsForActivity);

// Admin routes
router.get('/statistics', authenticateToken, requireRole('ADMIN'), pointsController.getPointStatistics);
router.post('/update-all', authenticateToken, requireRole('ADMIN'), pointsController.updateAllUserPoints);
router.get('/users', authenticateToken, requireRole('ADMIN'), pointsController.getAllUsersWithPoints);
router.post('/update-users', authenticateToken, requireRole('ADMIN'), validate('points.updateUsers'), pointsController.updateUserPointsManually);
router.post('/reset-users', authenticateToken, requireRole('ADMIN'), validate('points.resetUsers'), pointsController.resetUserPoints);

module.exports = router; 