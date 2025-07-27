const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { getMe, signup, login } = require('./user.controller');
const validate = require('../../middleware/validate');
const { signupSchema, loginSchema } = require('./user.validation');

const router = express.Router();

router.get('/me', authenticateToken, getMe);
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

module.exports = router; 