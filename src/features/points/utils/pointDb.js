const Point = require('../../../db/Point');
const Profile = require('../../../db/Profile');
const User = require('../../../db/User');

/**
 * Retrieves a user's point record.
 * @param {string} profileId - The ID of the user's profile.
 * @returns {Promise<Point|null>}
 */
async function getPointRecord(profileId) {
  return Point.findOne({ where: { profileId } });
}

/**
 * Upserts (creates or updates) a user's point record.
 * @param {string} profileId - The ID of the user's profile.
 * @param {number} value - The total point value.
 * @param {number} manualAdjustment - The manual adjustment value.
 * @returns {Promise<Point>}
 */
async function upsertPoint(profileId, value, manualAdjustment) {
  const [pointRecord, created] = await Point.upsert(
    {
      profileId: profileId,
      value: value,
      manualAdjustment: manualAdjustment,
    },
    {
      where: { profileId: profileId },
    },
  );
  return pointRecord;
}

/**
 * Get all users with their points for admin management
 */
async function getAllUsersWithPointsAndProfile() {
  try {
    const profiles = await Profile.findAll({
      include: [
        {
          model: Point,
          attributes: ['value', 'manualAdjustment'],
        },
        {
          model: User,
          attributes: ['id', 'email', 'role'],
        },
      ],
      attributes: ['id', 'name', 'class', 'batch', 'userId'],
    });

    return profiles.map((profile) => ({
      id: profile.userId,
      name: profile.name,
      email: profile.User.email,
      class: profile.class,
      batch: profile.batch,
      points: profile.Point?.value || 0,
      manualAdjustment: profile.Point?.manualAdjustment || 0,
      profileId: profile.id,
    }));
  } catch (error) {
    console.error('Error getting all users with points:', error);
    throw error;
  }
}

module.exports = {
  getPointRecord,
  upsertPoint,
  getAllUsersWithPointsAndProfile,
};
