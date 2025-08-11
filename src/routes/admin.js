const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getApiLogs, exportStudentsCsv } = require('../controllers/adminController');

const router = express.Router();

// Admin: Get API logs
router.get('/logs', authenticateToken, requireRole('ADMIN'), getApiLogs);

// Admin: Export students as CSV
router.get('/export-students', authenticateToken, requireRole('ADMIN'), exportStudentsCsv);

module.exports = router; 