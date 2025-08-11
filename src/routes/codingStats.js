const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { submitLeetCode, submitHackerRank, getStats } = require('../controllers/codingStatsController');

const router = express.Router();

// Student: Submit LeetCode stats
router.post('/leetcode', authenticateToken, requireRole('STUDENT'), submitLeetCode);

// Student: Submit HackerRank stats
router.post('/hackerrank', authenticateToken, requireRole('STUDENT'), submitHackerRank);

// Student: Get their coding stats
router.get('/', authenticateToken, requireRole('STUDENT'), getStats);

module.exports = router; 