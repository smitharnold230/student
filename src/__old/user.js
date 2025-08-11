const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getMe } = require('../controllers/userController');

const router = express.Router();

router.get('/me', authenticateToken, getMe);

module.exports = router; 