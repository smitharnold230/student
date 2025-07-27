const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { getApiLogs, exportStudentsCsv, getPointRules, updatePointRule } = require('./admin.controller');

const router = express.Router();

router.get('/logs', authenticateToken, requireRole('ADMIN'), getApiLogs);
router.get('/export-students', authenticateToken, requireRole('ADMIN'), exportStudentsCsv);
router.get('/point-rules', authenticateToken, requireRole('ADMIN'), getPointRules);
router.post('/point-rules', authenticateToken, requireRole('ADMIN'), updatePointRule);

module.exports = router; 