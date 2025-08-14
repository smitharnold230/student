/**
 * Authentication & authorization middleware
 */
const jwt = require('jsonwebtoken');

/**
 * Require valid JWT token
 */
const requireAuth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

  if (!token) {
    return next({
      status: 401,
      code: 'NO_TOKEN',
      message: 'Missing authorization token',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload;
    next();
  } catch {
    next({
      status: 401,
      code: 'BAD_TOKEN',
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Require specific role(s)
 */
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next({
        status: 403,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
    }
    next();
  };

module.exports = { requireAuth, requireRole };
