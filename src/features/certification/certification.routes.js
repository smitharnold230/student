/**
 * Certification routes with validation and auth
 */
const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../../middleware/validate');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { upload } = require('../../middleware/upload');
const certificationService = require('./certification.service');

const createSchema = {
  body: z.object({
    title: z.string().min(1),
    issuer: z.string().min(1),
    issueDate: z.string(),
    expiryDate: z.string().optional()
  })
};

router.post('/', requireAuth, upload.single('file'), validate(createSchema), async (req, res, next) => {
  try {
    const data = await certificationService.createCertification({
      ...req.body,
      file: req.file
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const data = await certificationService.listCertifications();
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
