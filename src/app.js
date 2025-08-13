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

// 404 handler
app.use((req, res) => res.status(404).json({
  ok: false,
  code: 'NOT_FOUND',
  message: 'Route not found'
}));

// Global error handler
app.use(errorHandler);

module.exports = app;
