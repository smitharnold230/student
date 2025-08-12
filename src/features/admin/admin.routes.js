const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { validate, validateFileUpload } = require('../../middleware/validate');
const { getApiLogs, exportStudentsCsv, getPointRules, updatePointRule, getSystemStats, bulkUploadUsers, exportApiLogsCsv } = require('./admin.controller'); // Import new controller
const upload = require('../../middleware/upload'); // Import upload middleware

const router = express.Router();

router.get('/logs', authenticateToken, requireRole('ADMIN'), getApiLogs);
router.get('/export-students', authenticateToken, requireRole('ADMIN'), exportStudentsCsv);
router.get('/export-logs', authenticateToken, requireRole('ADMIN'), exportApiLogsCsv); // New route for exporting API logs
router.get('/point-rules', authenticateToken, requireRole('ADMIN'), getPointRules);
router.post('/point-rules', authenticateToken, requireRole('ADMIN'), validate('admin.updatePointRule'), updatePointRule);
router.get('/stats', authenticateToken, requireRole('ADMIN'), getSystemStats);

// New route for bulk user upload
router.post(
  '/users/bulk-upload',
  authenticateToken,
  requireRole('ADMIN'),
  upload.single('bulkUsers'), // Use 'bulkUsers' fieldname for multer
  validateFileUpload('bulkUsers', 10 * 1024 * 1024, [ // 10MB limit, allow xlsx, xls, csv
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]),
  bulkUploadUsers
);

module.exports = router;