const Profile = require('../../db/Profile');
const Point = require('../../db/Point');

async function getLeaderboard() {
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
    progression: s.Point ? s.Point.progression : 'Beginner',
    email: s.email,
  }));
}

async function getMyRank(userId) {
  const profile = await Profile.findOne({ where: { userId }, include: [Point] });
  if (!profile) throw new Error('Profile not found');
  const all = await Profile.findAll({ include: [Point], order: [[{ model: Point }, 'value', 'DESC']] });
  const rank = all.findIndex(s => s.id === profile.id) + 1;
  return {
    rank,
    points: profile.Point ? profile.Point.value : 0,
    progression: profile.Point ? profile.Point.progression : 'Beginner',
  };
}

module.exports = { getLeaderboard, getMyRank }; 