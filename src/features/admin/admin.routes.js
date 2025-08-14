/**
 * Admin routes with validation and auth
 */
const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../../middleware/validate');
const { requireAuth, requireRole } = require('../../middleware/auth');
const adminService = require('./admin.service');

const userSchema = {
  body: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['student', 'admin']),
  }),
};

router.post(
  '/users',
  requireAuth,
  requireRole('admin'),
  validate(userSchema),
  async (req, res, next) => {
    try {
      const data = await adminService.createUser(req.body);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },
);

router.get(
  '/dashboard',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const data = await adminService.getDashboardStats();
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },
);

module.exports = router;
