const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'ADMIN'])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

module.exports = { signupSchema, loginSchema }; 