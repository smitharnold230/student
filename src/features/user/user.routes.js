/**
 * User routes with validation and auth
 */
const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../../middleware/validate');
const { requireAuth, requireRole } = require('../../middleware/auth');
const userService = require('./user.service');

const createSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['student', 'admin']).optional(),
  }),
};

const updateSchema = {
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
  }),
};

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validate(createSchema),
  async (req, res, next) => {
    try {
      const data = await userService.createUser(req.body);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },
);

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const data = await userService.listUsers();
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.put(
  '/:id',
  requireAuth,
  validate(updateSchema),
  async (req, res, next) => {
    try {
      const data = await userService.updateUser(req.params.id, req.body);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },
);

module.exports = router;
