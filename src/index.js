require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { generalLimiter } = require('./middleware/rateLimiter');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Apply rate limiting to all routes
app.use(generalLimiter);

const apiLogger = require('./middleware/apiLogger');
app.use(apiLogger);

const sequelize = require('./db/sequelize');
// Import models to set up associations
require('./db/models');
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
const { authenticateToken, requireRole } = require('./middleware/auth');

// Remove old authRoutes import and usage
// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);

const { authLimiter, uploadLimiter, adminLimiter, pointsLimiter } = require('./middleware/rateLimiter');

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

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const Event = require('./db/Event');
    const Submission = require('./db/Submission');
    const Profile = require('./db/Profile');
    
    const eventCount = await Event.count();
    const submissionCount = await Submission.count();
    const profileCount = await Profile.count();
    
    // Test table structure
    const sequelize = Event.sequelize;
    const [eventResults] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'events'");
    const [submissionResults] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'submissions'");
    const [profileResults] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles'");
    
    res.json({ 
      status: 'ok', 
      message: 'Database connection working', 
      eventCount,
      submissionCount,
      profileCount,
      eventStructure: eventResults,
      submissionStructure: submissionResults,
      profileStructure: profileResults
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

// Test body parser
app.post('/api/test-body', (req, res) => {
  console.log('Test body endpoint hit');
  console.log('Request body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  res.json({ 
    status: 'ok', 
    message: 'Body parser working', 
    receivedBody: req.body,
    contentType: req.headers['content-type']
  });
});

// TODO: Import and use routes here

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// Initialize socket service
const socketService = require('./services/socket');
socketService.initSocket(io);

// Make io available throughout the app
app.set('io', io);

// Sync Sequelize models and then start server
sequelize.sync({ force: false, alter: true }).then(async () => {
  console.log('Database synced successfully with alterations');
  
  // Run database migrations
  try {
    const Migration = require('./migrations/migration');
    const migration = new Migration();
    await migration.runMigrations();
  } catch (error) {
    console.error('Migration error:', error);
  }
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  io.on('connection', (socket) => {
    // Join user room by userId if provided
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });
    socket.on('disconnect', () => {});
  });
}).catch((err) => {
  console.error('Failed to sync database:', err);
  process.exit(1);
});