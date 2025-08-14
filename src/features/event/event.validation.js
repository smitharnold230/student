const { z } = require('zod');

const validationSchemas = {
  user: {
    login: z.object({
      email: z
        .string()
        .email('Invalid email format')
        .min(1, 'Email is required'),
      password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password too long'),
    }),
    signup: z.object({
      email: z
        .string()
        .email('Invalid email format')
        .min(1, 'Email is required'),
      password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password too long'),
      role: z.enum(['STUDENT', 'ADMIN'], {
        message: 'Role must be STUDENT or ADMIN',
      }),
    }),
  },

  profile: {
    // This schema is for the 'requestProfileEdit' endpoint
    editRequest: z
      .object({
        name: z
          .string()
          .min(1, 'Full name is required')
          .max(100, 'Name too long')
          .optional(),
        degree: z
          .string()
          .min(1, 'Degree is required')
          .max(50, 'Degree too long')
          .optional(),
        class: z
          .string()
          .min(1, 'Class is required')
          .max(50, 'Class name too long')
          .optional(),
        status: z
          .string()
          .min(1, 'Status is required')
          .max(20, 'Status too long')
          .optional(),
        transport: z.string().max(50, 'Transport info too long').optional(),
        hostelInfo: z.string().max(200, 'Hostel info too long').optional(),
      })
      .refine(
        (data) => Object.keys(data).length > 0,
        'At least one field must be provided for edit request',
      ),
    uploadPhoto: z.object({
      // File validation is primarily handled by Multer and validateFileUpload middleware
      file: z.any().optional(),
    }),
  },

  event: {
    create: z.object({
      name: z
        .string()
        .min(1, 'Event name is required')
        .max(100, 'Event name too long'),
      type: z.enum(['WORKSHOP', 'HACKATHON'], {
        message: 'Event type must be WORKSHOP or HACKATHON',
      }),
      date: z.string().datetime('Invalid date format'),
      organizer: z
        .string()
        .min(1, 'Organizer is required')
        .max(100, 'Organizer name too long'),
      url: z.string().url('Invalid URL format').optional().or(z.literal('')),
      link: z.string().url('Invalid URL format').optional().or(z.literal('')),
      certificationDeadline: z
        .string()
        .datetime('Invalid date format')
        .optional()
        .or(z.literal('')),
    }),
    participate: z.object({
      eventId: z.string().uuid('Invalid event ID format'),
    }),
    update: z
      .object({
        // New schema for updating an event
        id: z.string().uuid('Invalid event ID format'), // Event ID is required for update
        name: z
          .string()
          .min(1, 'Event name is required')
          .max(100, 'Event name too long')
          .optional(),
        type: z
          .enum(['WORKSHOP', 'HACKATHON'], {
            message: 'Event type must be WORKSHOP or HACKATHON',
          })
          .optional(),
        date: z.string().datetime('Invalid date format').optional(),
        organizer: z
          .string()
          .min(1, 'Organizer is required')
          .max(100, 'Organizer name too long')
          .optional(),
        url: z.string().url('Invalid URL format').or(z.literal('')).optional(),
        link: z.string().url('Invalid URL format').or(z.literal('')).optional(),
        certificationDeadline: z
          .string()
          .datetime('Invalid date format')
          .optional()
          .or(z.literal('')),
      })
      .refine(
        (data) =>
          Object.keys(data).some(
            (key) => key !== 'id' && data[key] !== undefined,
          ),
        'At least one field must be provided for update',
      ),
    delete: z.object({
      // New schema for deleting an event
      eventId: z.string().uuid('Invalid event ID format'),
    }),
  },

  certification: {
    upload: z.object({
      eventId: z.string().uuid('Invalid event ID format'),
      // File validation is primarily handled by Multer and validateFileUpload middleware
      // Zod schema here is minimal as Multer processes the file before Zod
      file: z.any().optional(),
    }),
    verify: z.object({
      status: z.enum(['APPROVED', 'REJECTED'], {
        message: 'Status must be APPROVED or REJECTED',
      }),
    }),
  },

  codingStats: {
    leetcode: z.object({
      url: z
        .string()
        .url('Invalid LeetCode URL')
        .regex(/leetcode\.com/, 'Must be a LeetCode URL'),
    }),
    hackerrank: z.object({
      url: z
        .string()
        .url('Invalid HackerRank URL')
        .regex(/hackerrank\.com/, 'Must be a HackerRank URL'),
      manualCount: z
        .number()
        .int()
        .min(0, 'Problems solved must be non-negative')
        .optional(),
    }),
  },

  points: {
    updateUsers: z.object({
      userIds: z
        .array(z.string().uuid('Invalid user ID format'))
        .min(1, 'At least one user ID is required'),
      pointsToAdd: z
        .number()
        .int('Points must be an integer')
        .min(-1000, 'Points adjustment too large')
        .max(1000, 'Points adjustment too large'),
      reason: z
        .string()
        .min(1, 'Reason is required')
        .max(200, 'Reason too long'),
    }),
    resetUsers: z.object({
      userIds: z
        .array(z.string().uuid('Invalid user ID format'))
        .min(1, 'At least one user ID is required'),
      reason: z
        .string()
        .min(1, 'Reason is required')
        .max(200, 'Reason too long'),
    }),
    addActivity: z.object({
      activityType: z.string().min(1, 'Activity type is required'),
      activityData: z.any().optional(),
    }),
  },

  eligibility: {
    assignBatch: z.object({
      userId: z.string().uuid('Invalid user ID format'),
      batch: z
        .string()
        .min(1, 'Batch is required')
        .max(20, 'Batch name too long'),
      auto: z.boolean().optional(),
    }),
  },

  admin: {
    approveRequest: z.object({
      status: z.enum(['APPROVED', 'REJECTED'], {
        message: 'Status must be APPROVED or REJECTED',
      }),
      adminNote: z.string().max(500, 'Admin note too long').optional(),
    }),
    updatePointRule: z.object({
      key: z
        .string()
        .min(1, 'Rule key is required')
        .max(50, 'Rule key too long'),
      value: z
        .number()
        .int('Value must be an integer')
        .min(0, 'Value must be non-negative'),
      description: z
        .string()
        .min(1, 'Description is required')
        .max(200, 'Description too long'),
    }),
  },

  notification: {
    create: z.object({
      title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
      message: z
        .string()
        .min(1, 'Message is required')
        .max(500, 'Message too long'),
      type: z.enum(
        [
          'INFO',
          'SUCCESS',
          'WARNING',
          'ERROR',
          'CERTIFICATION_REMINDER',
          'POINTS_UPDATE',
          'POINTS_RESET',
        ],
        { message: 'Invalid notification type' },
      ),
      userId: z.string().uuid('Invalid user ID format').optional(),
      eventId: z.string().uuid('Invalid event ID format').optional(),
      deadline: z.string().datetime('Invalid deadline format').optional(),
    }),
  },
};

const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data.trim().replace(/[<>]/g, '');
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return data;
};

const validate = (schemaPath) => {
  return (req, res, next) => {
    try {
      const sanitizedBody = sanitizeInput(req.body);
      const sanitizedQuery = sanitizeInput(req.query);
      const sanitizedParams = sanitizeInput(req.params);

      const schemaKeys = schemaPath.split('.');
      let schema = validationSchemas;
      for (const key of schemaKeys) {
        schema = schema[key];
        if (!schema) {
          return res.status(400).json({ error: 'Invalid validation schema' });
        }
      }

      const dataToValidate = {
        ...sanitizedBody,
        ...sanitizedQuery,
        ...sanitizedParams,
      };

      const validatedData = schema.parse(dataToValidate);

      req.body = { ...req.body, ...validatedData };
      req.query = { ...req.query, ...validatedData };
      req.params = { ...req.params, ...validatedData };

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }

      console.error('Validation error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
      });
    }
  };
};

const validateFileUpload = (
  fieldName,
  maxSize = 10 * 1024 * 1024,
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
) => {
  return (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: `Please upload a file for ${fieldName}`,
        });
      }

      if (req.file.size > maxSize) {
        return res.status(400).json({
          error: 'File too large',
          message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
        });
      }

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: `File must be one of: ${allowedTypes.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('File validation error:', error);
      return res.status(500).json({
        error: 'File validation failed',
      });
    }
  };
};

module.exports = {
  validate,
  validateFileUpload,
  validationSchemas,
};
