const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { checkEligibility, assignBatch, assignAllEligibleBatches } = require('./eligibility.controller');

const router = express.Router();

// Student: Check eligibility
router.get('/check', authenticateToken, requireRole('STUDENT'), checkEligibility);
// Admin: Assign batch (auto/manual)
router.post('/assign', authenticateToken, requireRole('ADMIN'), validate('eligibility.assignBatch'), assignBatch);
// Admin: Trigger batch assignment for all eligible students
router.post('/assign-all-eligible', authenticateToken, requireRole('ADMIN'), assignAllEligibleBatches);

module.exports = router;