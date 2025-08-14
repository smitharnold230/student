/**
 * Event routes with validation and role-based access control
 */
const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../../middleware/validate');
const { requireAuth, requireRole } = require('../../middleware/auth');
const eventService = require('./event.service');

const createSchema = {
  body: z.object({
    name: z.string().min(3),
    startsAt: z.string(),
    endsAt: z.string(),
    description: z.string().optional(),
  }),
};

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validate(createSchema),
  async (req, res, next) => {
    try {
      const data = await eventService.createEvent(req.body);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },
);

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const data = await eventService.listEvents();
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
