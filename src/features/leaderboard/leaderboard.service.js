const Profile = require('../../db/Profile');
const Point = require('../../db/Point');
const pointsService = require('../points/points.service');

async function getLeaderboard() {
  // First, ensure all users have updated points
  try {
    await pointsService.updateAllUserPoints();
  } catch (error) {
    console.error('Error updating all user points:', error);
  }
  
  const students = await Profile.findAll({
    include: [
      { model: Point },
    ],
    order: [[{ model: Point }, 'value', 'DESC']],
  });
  return students.map((s, i) => ({
    rank: i + 1,
    name: s.name,
    class: s.class,
    batch: s.batch,
    points: s.Point ? s.Point.value : 0,
            // Removed progression - only using batches
    email: s.email,
  }));
}

async function getMyRank(userId) {
  // Update user's points first
  try {
    await pointsService.updateUserPoints(userId);
  } catch (error) {
    console.error('Error updating user points:', error);
  }
  
  const profile = await Profile.findOne({ where: { userId }, include: [Point] });
  if (!profile) throw new Error('Profile not found');
  const all = await Profile.findAll({ include: [Point], order: [[{ model: Point }, 'value', 'DESC']] });
  const rank = all.findIndex(s => s.id === profile.id) + 1;
  return {
    rank,
    points: profile.Point ? profile.Point.value : 0,
            // Removed progression - only using batches
  };
}

module.exports = { getLeaderboard, getMyRank }; 