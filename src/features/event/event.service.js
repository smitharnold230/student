const Event = require('../../db/Event');
const Profile = require('../../db/Profile');
const EventParticipation = require('../../db/EventParticipation');
const Notification = require('../../db/Notification');
const pointsService = require('../points/points.service');

async function createEvent(data) {
  try {
    console.log('Creating event with data:', data);
    
    // Test if Event model is properly imported
    if (!Event) {
      throw new Error('Event model is not properly imported');
    }
    
    // Convert date strings to Date objects and exclude certificationDeadline
    const { certificationDeadline, ...restData } = data;
    const eventData = {
      ...restData,
      date: restData.date ? new Date(restData.date) : null,
      // Exclude certificationDeadline to avoid column not found error
    };
    
    console.log('Processed event data:', eventData);
    
    const event = await Event.create(eventData);
    console.log('Event created successfully:', event.toJSON());
    return event;
  } catch (error) {
    console.error('Error in createEvent service:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

async function getEvents(userId = null) {
  try {
    console.log('Fetching all events...');
    
    // Test if Event model is properly imported
    if (!Event) {
      throw new Error('Event model is not properly imported');
    }
    
    // Test basic query first
    const count = await Event.count();
    console.log(`Total events in database: ${count}`);
    
    // Exclude certificationDeadline to avoid column not found error
    const events = await Event.findAll({
      attributes: { exclude: ['certificationDeadline'] }
    });
    console.log(`Found ${events.length} events`);
    
    // If userId is provided, add participation status
    if (userId) {
      const participations = await EventParticipation.findAll({
        where: { userId },
        attributes: ['eventId']
      });
      const participatedEventIds = participations.map(p => p.eventId);
      
      return events.map(event => ({
        ...event.toJSON(),
        isParticipated: participatedEventIds.includes(event.id)
      }));
    }
    
    return events;
  } catch (error) {
    console.error('Error in getEvents service:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

async function participateInEvent(userId, eventId) {
  try {
    console.log(`User ${userId} attempting to participate in event ${eventId}`);
    
    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Check if user already participated
    const existingParticipation = await EventParticipation.findOne({
      where: { userId, eventId }
    });
    
    if (existingParticipation) {
      return { message: 'Already participated in this event' };
    }
    
    // Create participation record
    await EventParticipation.create({
      userId,
      eventId,
      participatedAt: new Date()
    });
    
    // Add points for participation
    try {
      const activityType = event.type === 'WORKSHOP' ? 'WORKSHOP_PARTICIPATION' : 'HACKATHON_PARTICIPATION';
      await pointsService.addPointsForActivity(userId, activityType, { eventName: event.name });
      console.log(`Points added for ${activityType} for user ${userId}`);
    } catch (error) {
      console.error('Error adding points for event participation:', error);
      // Don't fail the participation if points fail
    }
    
    console.log(`Participation recorded for user ${userId} in event ${eventId}`);
    return { message: 'Participation recorded successfully' };
  } catch (error) {
    console.error('Error in participateInEvent:', error);
    throw error;
  }
}

async function acceptEvent(userId, eventId) {
  try {
    console.log(`User ${userId} attempting to accept event ${eventId}`);
    
    // Check if event exists - exclude certificationDeadline to avoid column error
    const event = await Event.findByPk(eventId, {
      attributes: { exclude: ['certificationDeadline'] }
    });
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Check if user already accepted this event
    const existingAcceptance = await EventParticipation.findOne({
      where: { userId, eventId }
    });
    
    if (existingAcceptance) {
      return { message: 'Already accepted this event' };
    }
    
    // Create acceptance record
    await EventParticipation.create({
      userId,
      eventId,
      participatedAt: new Date()
    });
    
    // Add points for participation
    try {
      const activityType = event.type === 'WORKSHOP' ? 'WORKSHOP_PARTICIPATION' : 'HACKATHON_PARTICIPATION';
      await pointsService.addPointsForActivity(userId, activityType, { eventName: event.name });
      console.log(`Points added for ${activityType} for user ${userId}`);
    } catch (error) {
      console.error('Error adding points for event participation:', error);
      // Don't fail the participation if points fail
    }
    
    // Create certification deadline reminder notification if deadline exists
    if (event.certificationDeadline) {
      await Notification.create({
        userId,
        type: 'CERTIFICATION_REMINDER',
        title: 'Certification Deadline Reminder',
        message: `Don't forget to submit your certification for "${event.name}" by ${new Date(event.certificationDeadline).toLocaleDateString()}`,
        eventId: eventId,
        deadline: event.certificationDeadline,
        read: false,
      });
      console.log(`Certification reminder notification created for user ${userId} and event ${eventId}`);
    }
    
    console.log(`Event acceptance recorded for user ${userId} in event ${eventId}`);
    return { message: 'Event accepted successfully' };
  } catch (error) {
    console.error('Error in acceptEvent:', error);
    throw error;
  }
}

async function getEventDetails(eventId) {
  try {
    const event = await Event.findByPk(eventId, {
      attributes: { exclude: ['certificationDeadline'] }
    });
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  } catch (error) {
    console.error('Error in getEventDetails:', error);
    throw error;
  }
}

async function setCertificationDeadline(eventId, deadline) {
  const event = await Event.findByPk(eventId);
  if (!event) throw new Error('Event not found');
  event.certificationDeadline = deadline;
  await event.save();
  return event;
}

async function getCertificationDeadline(eventId) {
  const event = await Event.findByPk(eventId);
  if (!event) throw new Error('Event not found');
  return { eventId, certificationDeadline: event.certificationDeadline };
}

module.exports = { createEvent, getEvents, participateInEvent, acceptEvent, getEventDetails, setCertificationDeadline, getCertificationDeadline };