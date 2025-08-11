const eventService = require('./event.service');

async function createEvent(req, res, next) {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({ message: 'Event created', event });
  } catch (err) {
    console.error('Event creation error:', err);
    next(err);
  }
}

async function getEvents(req, res, next) {
  try {
    const userId = req.user ? req.user.userId : null;
    const events = await eventService.getEvents(userId);
    res.json(events);
  } catch (err) {
    console.error('Error in getEvents controller:', err);
    next(err);
  }
}

async function participateInEvent(req, res, next) {
  try {
    const { eventId } = req.body;
    const result = await eventService.participateInEvent(req.user.userId, eventId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function acceptEvent(req, res, next) {
  try {
    const { eventId } = req.body;
    const result = await eventService.acceptEvent(req.user.userId, eventId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getEventDetails(req, res, next) {
  try {
    const { eventId } = req.params;
    const event = await eventService.getEventDetails(eventId);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function setCertificationDeadline(req, res, next) {
  try {
    const { eventId, deadline } = req.body;
    const event = await eventService.setCertificationDeadline(eventId, deadline);
    res.json({ message: 'Certification deadline set', event });
  } catch (err) {
    next(err);
  }
}

async function getCertificationDeadline(req, res, next) {
  try {
    const { eventId } = req.params;
    const result = await eventService.getCertificationDeadline(eventId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { createEvent, getEvents, participateInEvent, acceptEvent, getEventDetails, setCertificationDeadline, getCertificationDeadline };