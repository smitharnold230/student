const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getLeaderboard, getMyRank } = require('../controllers/leaderboardController');

const router = express.Router();

// Get leaderboard (all students)
router.get('/', authenticateToken, getLeaderboard);

// Get current student's rank
router.get('/me', authenticateToken, getMyRank);

module.exports = router; 