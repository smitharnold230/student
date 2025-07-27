const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { getLeaderboard, getMyRank } = require('./leaderboard.controller');

const router = express.Router();

router.get('/', authenticateToken, getLeaderboard);
router.get('/me', authenticateToken, getMyRank);

module.exports = router; 