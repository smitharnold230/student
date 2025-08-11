const Profile = require('../../db/Profile');
const Ticket = require('../../db/Ticket');
const User = require('../../db/User');

async function getProfileByUserId(userId) {
  let profile = await Profile.findOne({ where: { userId } });
  
  if (!profile) {
    profile = await Profile.create({
      userId,
      name: 'Student',
      degree: 'Not specified',
      class: 'Not specified',
      status: 'ACTIVE',
      transport: 'Not specified',
      hostelInfo: 'Not specified',
      batch: null, // Allow batch to be null initially
    });
  }
  
  return profile;
}

async function createEditTicket(userId, requestedData) {
  return Ticket.create({ userId, requestedData, status: 'PENDING' });
}

async function updateTicketStatus(ticketId, status, adminNote) {
  return Ticket.update({ status, adminNote }, { where: { id: ticketId }, returning: true });
}

async function updateProfileByUserId(userId, data) {
  return Profile.update(data, { where: { userId } });
}

async function getPendingProfileRequests() {
  const tickets = await Ticket.findAll({
    where: { status: 'PENDING' },
    order: [['createdAt', 'DESC']],
    include: [{
      model: User,
      attributes: ['email']
    }]
  });
  
  return tickets.map(ticket => ({
    id: ticket.id,
    userId: ticket.userId,
    userEmail: ticket.User?.email || 'Unknown',
    userName: ticket.requestedData.name || 'Unknown', // Use requested name if available
    requestedData: ticket.requestedData,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    adminNote: ticket.adminNote,
  }));
}

async function getAllStudents() {
  const students = await Profile.findAll({
    include: [{
      model: User,
      attributes: ['id', 'email', 'role']
    }],
    where: {
      '$User.role$': 'STUDENT'
    },
    order: [['name', 'ASC']]
  });
  
  return students.map(student => ({
    id: student.User.id,
    name: student.name,
    email: student.User.email,
    class: student.class,
    batch: student.batch,
    degree: student.degree,
    status: student.status,
    transport: student.transport,
    hostelInfo: student.hostelInfo
  }));
}

module.exports = { 
  getProfileByUserId, 
  createEditTicket, 
  updateTicketStatus, 
  updateProfileByUserId,
  getPendingProfileRequests,
  getAllStudents
};