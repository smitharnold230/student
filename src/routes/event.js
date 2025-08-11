const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createEvent, getEvents, participateInEvent } = require('../controllers/eventController');

const router = express.Router();

// Admin: Create event
router.post('/', authenticateToken, requireRole('ADMIN'), createEvent);

// All: Get events
router.get('/', authenticateToken, getEvents);

// Student: Participate in event
router.post('/participate', authenticateToken, requireRole('STUDENT'), participateInEvent);

module.exports = router; 