const Event = require('../../../db/Event');
const EventParticipation = require('../../../db/EventParticipation');
const CodingStat = require('../../../db/CodingStat');
const Submission = require('../../../db/Submission');
const { getPointRules } = require('./pointRules');

/**
 * Calculates points for a user based on their activities.
 * @param {string} profileId - The ID of the user's profile.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{activityBasedPoints: number, breakdown: object}>}
 */
async function calculateActivityPoints(profileId, userId) {
  let activityBasedPoints = 0;
  const pointBreakdown = {};

  const pointRules = await getPointRules();
  const rulesMap = pointRules.reduce((acc, rule) => {
    acc[rule.key] = rule.value;
    return acc;
  }, {});

  // 1. Calculate workshop participation points
  const workshopParticipations = await EventParticipation.findAll({
    include: [{
      model: Event,
      where: { type: 'WORKSHOP' },
      attributes: ['id', 'name']
    }],
    where: { userId }
  });

  const workshopPoints = workshopParticipations.length * (rulesMap.WORKSHOP_PARTICIPATION || 50);
  activityBasedPoints += workshopPoints;
  pointBreakdown.workshops = {
    count: workshopParticipations.length,
    points: workshopPoints,
    events: workshopParticipations.map(p => p.Event?.name).filter(Boolean)
  };

  // 2. Calculate hackathon participation points
  const hackathonParticipations = await EventParticipation.findAll({
    include: [{
      model: Event,
      where: { type: 'HACKATHON' },
      attributes: ['id', 'name']
    }],
    where: { userId }
  });

  const hackathonPoints = hackathonParticipations.length * (rulesMap.HACKATHON_PARTICIPATION || 100);
  activityBasedPoints += hackathonPoints;
  pointBreakdown.hackathons = {
    count: hackathonParticipations.length,
    points: hackathonPoints,
    events: hackathonParticipations.map(p => p.Event?.name).filter(Boolean)
  };

  // 3. Calculate certification points
  const approvedCertifications = await Submission.findAll({
    where: {
      profileId: profileId,
      status: 'APPROVED'
    },
    include: [{
      model: Event,
      attributes: ['id', 'name']
    }]
  });

  const certificationPoints = approvedCertifications.length * (rulesMap.CERTIFICATION_APPROVED || 75);
  activityBasedPoints += certificationPoints;
  pointBreakdown.certifications = {
    count: approvedCertifications.length,
    points: certificationPoints,
    certifications: approvedCertifications.map(c => c.Event?.name).filter(Boolean)
  };

  // 4. Calculate coding platform points
  const codingStats = await CodingStat.findAll({
    where: { profileId: profileId }
  });

  let codingPoints = 0;
  const codingBreakdown = {};

  for (const stat of codingStats) {
    let platformPoints = 0;

    if (stat.platform === 'LEETCODE') {
      platformPoints += rulesMap.LEETCODE_SUBMISSION || 25;
      const problemBonus = Math.floor(stat.problemsSolved / 50) * (rulesMap.LEETCODE_PROBLEMS_BONUS || 5);
      platformPoints += problemBonus;

      codingBreakdown.leetcode = {
        problemsSolved: stat.problemsSolved,
        basePoints: rulesMap.LEETCODE_SUBMISSION || 25,
        bonusPoints: problemBonus,
        totalPoints: platformPoints
      };
    } else if (stat.platform === 'HACKERRANK') {
      platformPoints += rulesMap.HACKERRANK_SUBMISSION || 25;
      const problemBonus = Math.floor(stat.problemsSolved / 50) * (rulesMap.HACKERRANK_PROBLEMS_BONUS || 3);
      platformPoints += problemBonus;

      codingBreakdown.hackerrank = {
        problemsSolved: stat.problemsSolved,
        basePoints: rulesMap.HACKERRANK_SUBMISSION || 25,
        bonusPoints: problemBonus,
        totalPoints: platformPoints
      };
    }

    codingPoints += platformPoints;
  }

  activityBasedPoints += codingPoints;
  pointBreakdown.coding = {
    totalPoints: codingPoints,
    breakdown: codingBreakdown
  };

  // 5. Calculate bonus points
  let bonusPoints = 0;
  const bonusBreakdown = {};

  if (workshopParticipations.length === 1) {
    const firstWorkshopBonus = rulesMap.FIRST_WORKSHOP_BONUS || 25;
    bonusPoints += firstWorkshopBonus;
    bonusBreakdown.firstWorkshop = firstWorkshopBonus;
  }

  if (hackathonParticipations.length === 1) {
    const firstHackathonBonus = rulesMap.FIRST_HACKATHON_BONUS || 50;
    bonusPoints += firstHackathonBonus;
    bonusBreakdown.firstHackathon = firstHackathonBonus;
  }

  if (approvedCertifications.length >= 2) {
    const streakBonus = rulesMap.CERTIFICATION_STREAK_BONUS || 20;
    bonusPoints += streakBonus;
    bonusBreakdown.certificationStreak = streakBonus;
  }

  activityBasedPoints += bonusPoints;
  pointBreakdown.bonuses = {
    totalPoints: bonusPoints,
    breakdown: bonusBreakdown
  };

  return { activityBasedPoints, breakdown: pointBreakdown };
}

module.exports = {
  calculateActivityPoints,
};