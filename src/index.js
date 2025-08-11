require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io'); // Keep import for type hinting if needed, but not directly used for instantiation here
const fs = require('fs'); // Import fs module
const path = require('path'); // Import path module

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

const { generalLimiter, authLimiter, uploadLimiter, adminLimiter, pointsLimiter } = require('./middleware/rateLimiter');
const apiLogger = require('./middleware/apiLogger');

// Apply general rate limiting to all routes
app.use(generalLimiter);
app.use(apiLogger);

const sequelize = require('./db/sequelize');
// Import models to set up associations
require('./db/models');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads');
const certificationsDir = path.join(uploadDir, 'certifications');
const profilePhotosDir = path.join(uploadDir, 'profile_photos');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(certificationsDir)) {
  fs.mkdirSync(certificationsDir);
}
if (!fs.existsSync(profilePhotosDir)) {
  fs.mkdirSync(profilePhotosDir);
}


// Import routes
const userRoutes = require('./features/user/user.routes');
const profileRoutes = require('./features/profile/profile.routes');
const eventRoutes = require('./features/event/event.routes');
const certificationRoutes = require('./features/certification/certification.routes');
const codingStatsRoutes = require('./features/codingStats/codingStats.routes');
const resumeRoutes = require('./features/resume/resume.routes');
const notificationRoutes = require('./features/notification/notification.routes');
const leaderboardRoutes = require('./features/leaderboard/leaderboard.routes');
const adminRoutes = require('./features/admin/admin.routes');
const eligibilityRoutes = require('./features/eligibility/eligibility.routes');
const pointsRoutes = require('./features/points/points.routes');

// Apply specific rate limiters to different route groups
app.use('/api/user', authLimiter, userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/certification', uploadLimiter, certificationRoutes);
app.use('/api/coding-stats', codingStatsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/points', pointsLimiter, pointsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SDMS backend is running.' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack || err.message);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    error: message,
    // Only send stack trace in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

const server = http.createServer(app); // Create the HTTP server

// Initialize socket service with the HTTP server
const socketService = require('./services/socket');
const ioInstance = socketService.initSocket(server); // Pass the HTTP server to initSocket
app.set('io', ioInstance); // Set the actual io instance on the app

// Connect to DB, run migrations, then sync models and start server
sequelize.authenticate().then(async () => {
  console.log('Database connection established.');
  
  // Run database migrations first
  try {
    const Migration = require('./migrations/migration');
    const migration = new Migration();
    await migration.runMigrations(); // This will apply schema changes and data cleanup
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1); // Exit if migrations fail
  }

  // Then, sync models (alter: true) to ensure any new models/columns not covered by migrations are added
  await sequelize.sync({ alter: true });
  console.log('Database synced successfully with alterations');
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect or sync database:', err);
  process.exit(1);
});