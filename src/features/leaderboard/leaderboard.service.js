const Profile = require('../../db/Profile');
const Point = require('../../db/Point');
const User = require('../../db/User'); // Added top-level import
const pointsService = require('../points/points.service'); // Added top-level import

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
    id: s.id, // Added student ID for unique key prop in frontend
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
    // Fetch the user to determine their role
    const user = await User.findByPk(userId, { attributes: ['role'] });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'ADMIN') {
      // Admins do not have a rank on the student leaderboard
      return { rank: null, points: null, totalStudents: null, message: 'Admins are not ranked on the student leaderboard.' };
    }

    // If it's a student, proceed with calculating their rank among students
    await pointsService.updateUserPoints(userId);
    
    const profile = await Profile.findOne({ where: { userId }, include: [Point] });
    if (!profile) throw new Error('Profile not found');
    
    // Fetch all student profiles, ordered by points
    const allStudents = await Profile.findAll({
      include: [
        { model: Point },
        {
          model: User,
          attributes: ['email'],
          where: { role: 'STUDENT' } // Ensure we only rank among students
        }
      ],
      order: [[{ model: Point }, 'value', 'DESC']],
    });
    
    const rank = allStudents.findIndex(s => s.id === profile.id) + 1;
    
    return {
      rank,
      points: profile.Point ? profile.Point.value : 0,
      totalStudents: allStudents.length,
    };
  } catch (error) {
    console.error('Error getting my rank:', error);
    throw error;
  }
}

module.exports = { getLeaderboard, getMyRank };