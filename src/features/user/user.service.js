const User = require('../../db/User');
const Profile = require('../../db/Profile');
const Point = require('../../db/Point');
const CodingStat = require('../../db/CodingStat');
const Submission = require('../../db/Submission');
const EventParticipation = require('../../db/EventParticipation');
const Notification = require('../../db/Notification');
const Ticket = require('../../db/Ticket');

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

/**
 * Helper function to cascade delete user-related data.
 * @param {string} userId - The ID of the user.
 * @param {string} profileId - The ID of the user's profile.
 */
async function _cascadeDeleteUserData(userId, profileId) {
  // Delete points
  await Point.destroy({ where: { profileId } });
  
  // Delete coding stats
  await CodingStat.destroy({ where: { profileId } });
  
  // Delete submissions
  await Submission.destroy({ where: { profileId } });
  
  // Delete event participations
  await EventParticipation.destroy({ where: { userId } });
  
  // Delete notifications
  await Notification.destroy({ where: { userId } });
  
  // Delete tickets
  await Ticket.destroy({ where: { userId } });
  
  // Delete profile
  await Profile.destroy({ where: { userId } });
}

async function deleteUser(userId) {
  const profile = await Profile.findOne({ where: { userId } });
  
  if (profile) {
    await _cascadeDeleteUserData(userId, profile.id);
  }
  
  // Finally delete the user
  await User.destroy({ where: { id: userId } });
  
  return { message: 'User deleted successfully' };
}

module.exports = { getMe, findByEmail, createUser, getAllUsers, deleteUser };