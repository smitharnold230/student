/**
 * Rate limiting middleware
 */
const rateLimit = require('express-rate-limit');

/**
 * General rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    code: 'RATE_LIMITED',
    message: 'Too many requests, please try again later'
  }
});

/**
 * Stricter rate limiter for login attempts
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    code: 'LOGIN_RATE_LIMITED',
    message: 'Too many login attempts, please try again later'
  }
});

module.exports = { authLimiter, loginLimiter };
