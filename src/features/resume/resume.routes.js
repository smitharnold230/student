const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { generateResume } = require('./resume.controller');

const router = express.Router();

router.get('/', authenticateToken, requireRole('STUDENT'), generateResume);

module.exports = router; 