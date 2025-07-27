const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { submitLeetCode, getStats } = require('./codingStats.controller');

const router = express.Router();

router.post('/leetcode', authenticateToken, requireRole('STUDENT'), submitLeetCode);
router.get('/', authenticateToken, requireRole('STUDENT'), getStats);

module.exports = router; 