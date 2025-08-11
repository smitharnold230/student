const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { getMe, signup, login, getAllUsers, deleteUser } = require('./user.controller');

const router = express.Router();

router.get('/me', authenticateToken, getMe);
router.post('/signup', validate('user.signup'), signup);
router.post('/login', validate('user.login'), login);

// Admin routes
router.get('/admin/all', authenticateToken, requireRole('ADMIN'), getAllUsers);
router.delete('/admin/:userId', authenticateToken, requireRole('ADMIN'), deleteUser);

module.exports = router; 