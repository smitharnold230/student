/**
 * Eligibility routes with validation and auth
 */
const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../../middleware/validate');
const { requireAuth, requireRole } = require('../../middleware/validate');
const eligibilityService = require('./eligibility.service');

const createSchema = {
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    criteria: z.string().min(1),
    startDate: z.string(),
    endDate: z.string()
  })
};

router.post('/', requireAuth, requireRole('admin'), validate(createSchema), async (req, res, next) => {
  try {
    const data = await eligibilityService.createEligibility(req.body);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const data = await eligibilityService.listEligibility();
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
