const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { generateResume } = require('../controllers/resumeController');

const router = express.Router();

// Student: Generate resume (returns JSON for now)
router.get('/', authenticateToken, requireRole('STUDENT'), generateResume);

module.exports = router; 