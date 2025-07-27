const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { checkEligibility, assignBatch } = require('./eligibility.controller');

const router = express.Router();

// Student: Check eligibility
router.get('/check', authenticateToken, requireRole('STUDENT'), checkEligibility);
// Admin: Assign batch (auto/manual)
router.post('/assign', authenticateToken, requireRole('ADMIN'), assignBatch);

module.exports = router; 