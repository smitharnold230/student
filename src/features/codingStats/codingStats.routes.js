const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { submitLeetCode, submitHackerRank, getStats } = require('./codingStats.controller');

const router = express.Router();

router.post('/leetcode', authenticateToken, requireRole('STUDENT'), validate('codingStats.leetcode'), submitLeetCode);
router.post('/hackerrank', authenticateToken, requireRole('STUDENT'), validate('codingStats.hackerrank'), submitHackerRank);
router.get('/', authenticateToken, requireRole(['STUDENT', 'ADMIN']), getStats); // Modified to allow both STUDENT and ADMIN

module.exports = router;