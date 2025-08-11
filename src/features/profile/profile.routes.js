const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { getProfile, requestProfileEdit, adminApproveProfileEdit, getPendingProfileRequests, getAllStudents } = require('./profile.controller');

const router = express.Router();

router.get('/', authenticateToken, requireRole('STUDENT'), getProfile);
router.post('/edit-request', authenticateToken, requireRole('STUDENT'), validate('profile.editRequest'), requestProfileEdit);
router.get('/admin/pending', authenticateToken, requireRole('ADMIN'), getPendingProfileRequests);
router.post('/admin/approve/:ticketId', authenticateToken, requireRole('ADMIN'), validate('admin.approveRequest'), adminApproveProfileEdit);
router.get('/admin/students', authenticateToken, requireRole('ADMIN'), getAllStudents);

module.exports = router; 