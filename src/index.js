require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
const apiLogger = require('./middleware/apiLogger');
app.use(apiLogger);

const sequelize = require('./db/sequelize');
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
const { authenticateToken, requireRole } = require('./middleware/auth');

// Remove old authRoutes import and usage
// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);

app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/certification', certificationRoutes);
app.use('/api/coding-stats', codingStatsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/eligibility', eligibilityRoutes);

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

// Sync Sequelize models and then start server
sequelize.sync({ force: false, alter: true }).then(async () => {
  console.log('Database synced successfully with alterations');
  
  // Manually add certificationDeadline column if it doesn't exist
  try {
    const Event = require('./db/Event');
    const sequelize = Event.sequelize;
    
    // Check if certificationDeadline column exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'certificationDeadline'
    `);
    
    if (results.length === 0) {
      console.log('Adding certificationDeadline column...');
      await sequelize.query(`
        ALTER TABLE events 
        ADD COLUMN "certificationDeadline" TIMESTAMP WITH TIME ZONE
      `);
      console.log('certificationDeadline column added successfully');
    } else {
      console.log('certificationDeadline column already exists');
    }
  } catch (error) {
    console.error('Error checking/adding certificationDeadline column:', error);
  }
  
  // Manually add verifiedById column to submissions table if it doesn't exist
  try {
    const Event = require('./db/Event');
    const sequelize = Event.sequelize;
    
    // Check if verifiedById column exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'submissions' AND column_name = 'verifiedById'
    `);
    
    if (results.length === 0) {
      console.log('Adding verifiedById column...');
      await sequelize.query(`
        ALTER TABLE submissions 
        ADD COLUMN "verifiedById" UUID
      `);
      console.log('verifiedById column added successfully');
    } else {
      console.log('verifiedById column already exists');
    }
  } catch (error) {
    console.error('Error checking/adding verifiedById column:', error);
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to sync database:', err);
  process.exit(1);
}); 