const User = require('../../db/User');
const Profile = require('../../db/Profile');

async function getMe(userId) {
  return User.findByPk(userId, {
    attributes: ['id', 'email', 'role']
  });
}

async function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function createUser({ email, password, role }) {
  const user = await User.create({ email, password, role });
  await Profile.create({
    userId: user.id,
    name: '',
    degree: '',
    class: '',
    status: '',
    transport: '',
    hostelInfo: '',
    batch: null,
  });
  return user;
}

async function getAllUsers() {
  return User.findAll({
    attributes: ['id', 'email', 'role', 'createdAt'],
    include: [{
      model: Profile,
      attributes: ['name', 'class', 'batch', 'status']
    }],
    order: [['createdAt', 'DESC']]
  });
}

async function deleteUser(userId) {
  // First delete associated data
  const profile = await Profile.findOne({ where: { userId } });
  if (profile) {
    // Delete associated records (points, coding stats, submissions, etc.)
    const Point = require('../../db/Point');
    const CodingStat = require('../../db/CodingStat');
    const Submission = require('../../db/Submission');
    const EventParticipation = require('../../db/EventParticipation');
    const Notification = require('../../db/Notification');
    const Ticket = require('../../db/Ticket');
    
    // Delete points
    await Point.destroy({ where: { profileId: profile.id } });
    
    // Delete coding stats
    await CodingStat.destroy({ where: { profileId: profile.id } });
    
    // Delete submissions
    await Submission.destroy({ where: { profileId: profile.id } });
    
    // Delete event participations
    await EventParticipation.destroy({ where: { userId } });
    
    // Delete notifications
    await Notification.destroy({ where: { userId } });
    
    // Delete tickets
    await Ticket.destroy({ where: { userId } });
    
    // Delete profile
    await Profile.destroy({ where: { userId } });
  }
  
  // Finally delete the user
  await User.destroy({ where: { id: userId } });
  
  return { message: 'User deleted successfully' };
}

module.exports = { getMe, findByEmail, createUser, getAllUsers, deleteUser }; 