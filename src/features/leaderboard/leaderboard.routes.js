/**
 * Leaderboard routes with validation and auth
 */
const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');
const leaderboardService = require('./leaderboard.service');

const querySchema = {
  query: z.object({
    limit: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional()
  })
};

router.get('/', requireAuth, validate(querySchema), async (req, res, next) => {
  try {
    const data = await leaderboardService.getLeaderboard({
      page: req.query.page || 1,
      limit: req.query.limit || 20
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
