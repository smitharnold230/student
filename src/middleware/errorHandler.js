/**
 * Global error handler middleware
 * Ensures consistent error responses across the API
 */
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Something went wrong';
  const details = err.details || undefined;

  // Log error in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    console.error('[ERROR]', code, message, details);
  }

  res.status(status).json({
    ok: false,
    code,
    message,
    ...(details && { details })
  });
};
