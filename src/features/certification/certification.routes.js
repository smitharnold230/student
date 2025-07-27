const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { uploadCertification, getPendingCertifications, getUserCertifications, verifyCertification } = require('./certification.controller');
const upload = require('../../middleware/upload');

const router = express.Router();

router.post('/upload', authenticateToken, requireRole('STUDENT'), upload.single('certification'), uploadCertification);
router.get('/pending', authenticateToken, requireRole('ADMIN'), getPendingCertifications);
router.get('/user', authenticateToken, requireRole('STUDENT'), getUserCertifications);
router.post('/verify/:submissionId', authenticateToken, requireRole('ADMIN'), verifyCertification);

module.exports = router; 