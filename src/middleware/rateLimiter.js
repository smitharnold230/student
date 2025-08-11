const rateLimit = require('express-rate-limit');

// Create different rate limiters for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// General API rate limiter (100 requests per 15 minutes)
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100,
  'Too many requests from this IP, please try again later.'
);

// Authentication rate limiter (5 requests per 15 minutes)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many authentication attempts, please try again later.'
);

// File upload rate limiter (10 uploads per hour)
const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10,
  'Too many file uploads, please try again later.'
);

// Admin endpoints rate limiter (50 requests per 15 minutes)
const adminLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50,
  'Too many admin requests, please try again later.'
);

// Points calculation rate limiter (Increased to 100 requests per 15 minutes)
const pointsLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // Increased from 20 to 100
  'Too many points calculation requests, please try again later.'
);

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  adminLimiter,
  pointsLimiter
};