const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { uploadCertification, getPendingCertifications, verifyCertification } = require('../controllers/certificationController');

const router = express.Router();

// Student: Upload certification
router.post('/upload', authenticateToken, requireRole('STUDENT'), uploadCertification);

// Admin: Get all pending certifications
router.get('/pending', authenticateToken, requireRole('ADMIN'), getPendingCertifications);

// Admin: Verify/reject certification
router.post('/verify/:submissionId', authenticateToken, requireRole('ADMIN'), verifyCertification);

module.exports = router; 