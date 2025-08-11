const Event = require('../../db/Event');
const Profile = require('../../db/Profile');
const EventParticipation = require('../../db/EventParticipation');
const Notification = require('../../db/Notification');
const pointsService = require('../points/points.service');
const Submission = require('../../db/Submission'); // Import Submission model

async function createEvent(data) {
  try {
    const eventData = {
      ...data,
      date: data.date ? new Date(data.date) : null,
      certificationDeadline: data.certificationDeadline ? new Date(data.certificationDeadline) : null,
    };
    
    const event = await Event.create(eventData);
    return event;
  } catch (error) {
    console.error('Error in createEvent service:', error);
    throw error;
  }
}

async function getEvents(userId = null) {
  try {
    const events = await Event.findAll();
    
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
    throw error;
  }
}

async function participateInEvent(userId, eventId) {
  try {
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    const existingParticipation = await EventParticipation.findOne({
      where: { userId, eventId }
    });
    
    if (existingParticipation) {
      return { message: 'Already participated in this event' };
    }
    
    await EventParticipation.create({
      userId,
      eventId,
      participatedAt: new Date()
    });
    
    try {
      const activityType = event.type === 'WORKSHOP' ? 'WORKSHOP_PARTICIPATION' : 'HACKATHON_PARTICIPATION';
      await pointsService.addPointsForActivity(userId, activityType, { eventName: event.name });
    } catch (error) {
      console.error('Error adding points for event participation:', error);
    }
    
    return { message: 'Participation recorded successfully' };
  } catch (error) {
    console.error('Error in participateInEvent:', error);
    throw error;
  }
}

async function acceptEvent(userId, eventId) {
  try {
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    const existingAcceptance = await EventParticipation.findOne({
      where: { userId, eventId }
    });
    
    if (existingAcceptance) {
      return { message: 'Already accepted this event' };
    }
    
    await EventParticipation.create({
      userId,
      eventId,
      participatedAt: new Date()
    });
    
    try {
      const activityType = event.type === 'WORKSHOP' ? 'WORKSHOP_PARTICIPATION' : 'HACKATHON_PARTICIPATION';
      await pointsService.addPointsForActivity(userId, activityType, { eventName: event.name });
    } catch (error) {
      console.error('Error adding points for event participation:', error);
    }
    
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
    }
    
    return { message: 'Event accepted successfully' };
  } catch (error) {
    console.error('Error in acceptEvent:', error);
    throw error;
  }
}

async function getEventDetails(eventId) {
  try {
    const event = await Event.findByPk(eventId);
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

async function updateEvent(eventId, data) {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const updatedData = { ...data };
  if (updatedData.date) {
    updatedData.date = new Date(updatedData.date);
  }
  if (updatedData.certificationDeadline) {
    updatedData.certificationDeadline = new Date(updatedData.certificationDeadline);
  } else if (updatedData.certificationDeadline === '') {
    updatedData.certificationDeadline = null; // Explicitly set to null if empty string
  }

  await event.update(updatedData);
  return event;
}

async function deleteEvent(eventId) {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  // Delete associated records first for data integrity
  await EventParticipation.destroy({ where: { eventId } });
  await Submission.destroy({ where: { eventId } });
  await Notification.destroy({ where: { eventId } }); // Delete notifications related to this event

  await event.destroy();
  return { message: 'Event deleted successfully' };
}

module.exports = { 
  createEvent, 
  getEvents, 
  participateInEvent, 
  acceptEvent, 
  getEventDetails, 
  setCertificationDeadline, 
  getCertificationDeadline,
  updateEvent, // Export new function
  deleteEvent // Export new function
};