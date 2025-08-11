const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { validate, validateFileUpload } = require('../../middleware/validate');
const { getProfile, requestProfileEdit, updateProfile, adminApproveProfileEdit, getPendingProfileRequests, getAllStudents, uploadProfilePhoto } = require('./profile.controller');
const upload = require('../../middleware/upload');

const router = express.Router();

router.get('/', authenticateToken, requireRole(['STUDENT', 'ADMIN']), getProfile);
router.post('/edit-request', authenticateToken, requireRole('STUDENT'), validate('profile.editRequest'), requestProfileEdit);
router.put('/', authenticateToken, requireRole('ADMIN'), validate('profile.editRequest'), updateProfile); // New: Direct update for admin
router.post('/upload-photo', authenticateToken, requireRole(['STUDENT', 'ADMIN']), upload.single('profilePhoto'), validateFileUpload('profilePhoto', 5 * 1024 * 1024, ['image/jpeg', 'image/png', 'image/jpg']), uploadProfilePhoto);

router.get('/admin/pending', authenticateToken, requireRole('ADMIN'), getPendingProfileRequests);
router.post('/admin/approve/:ticketId', authenticateToken, requireRole('ADMIN'), validate('admin.approveRequest'), adminApproveProfileEdit);
router.get('/admin/students', authenticateToken, requireRole('ADMIN'), getAllStudents);

module.exports = router;