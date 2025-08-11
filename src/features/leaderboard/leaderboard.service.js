const Profile = require('../../db/Profile');
const Point = require('../../db/Point');
const pointsService = require('../points/points.service');
const User = require('../../db/User'); // Import User model

async function getLeaderboard() {
  try {
    await pointsService.updateAllUserPoints();
  } catch (error) {
    console.error('Error updating all user points for leaderboard:', error);
  }
  
  const students = await Profile.findAll({
    include: [
      { model: Point },
      {
        model: User,
        attributes: ['email'],
        where: { role: 'STUDENT' } // Filter to include only students
      }
    ],
    order: [[{ model: Point }, 'value', 'DESC']],
  });
  return students.map((s, i) => ({
    rank: i + 1,
    name: s.name,
    class: s.class,
    batch: s.batch,
    points: s.Point ? s.Point.value : 0,
    email: s.User ? s.User.email : 'N/A',
  }));
}

async function getMyRank(userId) {
  try {
    await pointsService.updateUserPoints(userId);
  } catch (error) {
    console.error('Error updating user points for my rank:', error);
  }
  
  const profile = await Profile.findOne({ where: { userId }, include: [Point] });
  if (!profile) throw new Error('Profile not found');
  
  const all = await Profile.findAll({ include: [Point], order: [[{ model: Point }, 'value', 'DESC']] });
  const rank = all.findIndex(s => s.id === profile.id) + 1;
  
  return {
    rank,
    points: profile.Point ? profile.Point.value : 0,
    totalStudents: all.length, // Add total students for context
  };
}

module.exports = { getLeaderboard, getMyRank };