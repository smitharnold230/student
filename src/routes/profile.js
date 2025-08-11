const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getProfile, requestProfileEdit, adminApproveProfileEdit } = require('../controllers/profileController');

const router = express.Router();

// Student: View own profile
router.get('/', authenticateToken, requireRole('STUDENT'), getProfile);

// Student: Request profile edit
router.post('/edit-request', authenticateToken, requireRole('STUDENT'), requestProfileEdit);

// Admin: Approve/reject profile edit ticket
router.post('/admin/approve/:ticketId', authenticateToken, requireRole('ADMIN'), adminApproveProfileEdit);

module.exports = router; 