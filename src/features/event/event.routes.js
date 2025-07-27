const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { createEvent, getEvents, participateInEvent, acceptEvent, getEventDetails, setCertificationDeadline, getCertificationDeadline } = require('./event.controller');

const router = express.Router();

router.post('/', authenticateToken, requireRole('ADMIN'), (req, res, next) => {
  console.log('Event creation route hit');
  console.log('User:', req.user);
  console.log('Body:', req.body);
  createEvent(req, res, next);
});
router.get('/', authenticateToken, getEvents);
router.post('/participate', authenticateToken, requireRole('STUDENT'), participateInEvent);
router.post('/accept', authenticateToken, requireRole('STUDENT'), acceptEvent);
router.get('/:eventId', authenticateToken, getEventDetails);
// Admin: Set certification deadline
router.post('/set-deadline', authenticateToken, requireRole('ADMIN'), setCertificationDeadline);
// Admin: Get certification deadline for event
router.get('/deadline/:eventId', authenticateToken, requireRole('ADMIN'), getCertificationDeadline);

module.exports = router; 