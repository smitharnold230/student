const eventService = require('./event.service');

async function createEvent(req, res, next) {
  try {
    console.log('Received event data:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ 
        error: 'Request body is missing' 
      });
    }
    
    // Ensure req.body is an object
    if (typeof req.body !== 'object') {
      return res.status(400).json({ 
        error: 'Request body must be an object',
        received: typeof req.body
      });
    }
    
    let name, type, date, organizer, url, link, certificationDeadline;
    
    try {
      ({ name, type, date, organizer, url, link, certificationDeadline } = req.body);
    } catch (destructuringError) {
      console.error('Destructuring error:', destructuringError);
      return res.status(400).json({ 
        error: 'Invalid request body structure',
        details: destructuringError.message
      });
    }
    
    // Validate required fields
    if (!name || !type || !date || !organizer) {
      return res.status(400).json({ 
        error: 'Missing required fields. Name, type, date, and organizer are required.',
        received: { name, type, date, organizer }
      });
    }
    
    // Validate event type
    if (!['WORKSHOP', 'HACKATHON'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid event type. Must be WORKSHOP or HACKATHON.',
        received: type
      });
    }
    
    const event = await eventService.createEvent(req.body);
    res.status(201).json({ message: 'Event created', event });
  } catch (err) {
    console.error('Event creation error:', err);
    console.error('Error stack:', err.stack);
    next(err);
  }
}

async function getEvents(req, res, next) {
  try {
    console.log('GET /api/event - Fetching events...');
    const userId = req.user ? req.user.userId : null;
    const events = await eventService.getEvents(userId);
    console.log(`Successfully fetched ${events.length} events`);
    res.json(events);
  } catch (err) {
    console.error('Error in getEvents controller:', err);
    console.error('Error stack:', err.stack);
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