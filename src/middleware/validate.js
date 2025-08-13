/**
 * Request validation middleware using Zod schemas
 */
const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) req.body = schema.body.parse(req.body);
    if (schema.query) req.query = schema.query.parse(req.query);
    if (schema.params) req.params = schema.params.parse(req.params);
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      return next({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: e.errors
      });
    }
    next(e);
  }
};

module.exports = { validate };
