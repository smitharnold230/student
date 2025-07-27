const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { getProfile, requestProfileEdit, adminApproveProfileEdit, getPendingProfileRequests } = require('./profile.controller');

const router = express.Router();

router.get('/', authenticateToken, requireRole('STUDENT'), getProfile);
router.post('/edit-request', authenticateToken, requireRole('STUDENT'), requestProfileEdit);
router.get('/admin/pending', authenticateToken, requireRole('ADMIN'), getPendingProfileRequests);
router.post('/admin/approve/:ticketId', authenticateToken, requireRole('ADMIN'), adminApproveProfileEdit);

module.exports = router; 