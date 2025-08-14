/**
 * Points routes with validation and auth
 */
const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../../middleware/validate');
const { requireAuth, requireRole } = require('../../middleware/auth');
const pointsService = require('./points.service');

const updateSchema = {
  body: z.object({
    points: z.number().int().min(0),
    reason: z.string().min(1),
  }),
};

router.post(
  '/update',
  requireAuth,
  requireRole('admin'),
  validate(updateSchema),
  async (req, res, next) => {
    try {
      const data = await pointsService.updatePoints(req.body);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },
);

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const data = await pointsService.getUserPoints(req.user.id);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
