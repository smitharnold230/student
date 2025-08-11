const express = require('express');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { createEvent, getEvents, participateInEvent, acceptEvent, getEventDetails, setCertificationDeadline, getCertificationDeadline } = require('./event.controller');

const router = express.Router();

router.post('/', authenticateToken, requireRole('ADMIN'), validate('event.create'), createEvent);
router.get('/', authenticateToken, getEvents);
router.post('/participate', authenticateToken, requireRole('STUDENT'), validate('event.participate'), participateInEvent);
router.post('/accept', authenticateToken, requireRole('STUDENT'), validate('event.participate'), acceptEvent);
router.get('/:eventId', authenticateToken, getEventDetails);
// Admin: Set certification deadline
router.post('/set-deadline', authenticateToken, requireRole('ADMIN'), setCertificationDeadline);
// Admin: Get certification deadline for event
router.get('/deadline/:eventId', authenticateToken, requireRole('ADMIN'), getCertificationDeadline);

module.exports = router; 