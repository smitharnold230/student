const { z } = require('zod');

const uploadCertificationSchema = z.object({
  eventId: z.string(),
  fileUrl: z.string().url()
});

const verifyCertificationSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED'])
});

module.exports = { uploadCertificationSchema, verifyCertificationSchema }; 