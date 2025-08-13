/**
 * Enhanced Express app with security, validation, auth, and error handling middleware
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { authLimiter } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
app.use(authLimiter);

// Static files
app.use('/uploads', express.static('uploads'));

// Import and mount all feature routes
const leaderboardRoutes = require('./features/leaderboard/leaderboard.routes');
const eventRoutes = require('./features/event/event.routes');
const certificationRoutes = require('./features/certification/certification.routes');
const userRoutes = require('./features/user/user.routes');
const adminRoutes = require('./features/admin/admin.routes');
const pointsRoutes = require('./features/points/points.routes');
const eligibilityRoutes = require('./features/eligibility/eligibility.routes');
const filesRouter = require('./routes/files.routes');

// Mount routes
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/files', filesRouter);

// 404 handler
app.use((req, res) => res.status(404).json({
  ok: false,
  code: 'NOT_FOUND',
  message: 'Route not found'
}));

// Global error handler
app.use(errorHandler);

module.exports = app;
