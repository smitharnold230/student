const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { getApiLogs, exportStudentsCsv, getPointRules, updatePointRule, getSystemStats } = require('./admin.controller');

const router = express.Router();

router.get('/logs', authenticateToken, requireRole('ADMIN'), getApiLogs);
router.get('/export-students', authenticateToken, requireRole('ADMIN'), exportStudentsCsv);
router.get('/point-rules', authenticateToken, requireRole('ADMIN'), getPointRules);
router.post('/point-rules', authenticateToken, requireRole('ADMIN'), validate('admin.updatePointRule'), updatePointRule);
router.get('/stats', authenticateToken, requireRole('ADMIN'), getSystemStats);

module.exports = router; 