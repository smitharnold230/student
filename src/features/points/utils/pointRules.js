const PointRule = require('../../../db/PointRule');

const DEFAULT_POINT_RULES = {
  WORKSHOP_PARTICIPATION: {
    value: 50,
    description: 'Points for workshop participation',
  },
  HACKATHON_PARTICIPATION: {
    value: 100,
    description: 'Points for hackathon participation',
  },
  CERTIFICATION_APPROVED: {
    value: 75,
    description: 'Points for approved certification',
  },
  LEETCODE_SUBMISSION: {
    value: 25,
    description: 'Points for LeetCode submission',
  },
  HACKERRANK_SUBMISSION: {
    value: 25,
    description: 'Points for HackerRank submission',
  },
  LEETCODE_PROBLEMS_BONUS: {
    value: 5,
    description: 'Bonus points per 50 LeetCode problems solved',
  },
  HACKERRANK_PROBLEMS_BONUS: {
    value: 3,
    description: 'Bonus points per 50 HackerRank problems solved',
  },
  FIRST_WORKSHOP_BONUS: {
    value: 25,
    description: 'Bonus for first workshop participation',
  },
  FIRST_HACKATHON_BONUS: {
    value: 50,
    description: 'Bonus for first hackathon participation',
  },
  CERTIFICATION_STREAK_BONUS: {
    value: 20,
    description: 'Bonus for consecutive approved certifications',
  },
};

/**
 * Get point rules from database or use defaults
 */
async function getPointRules() {
  try {
    const rules = await PointRule.findAll();
    if (rules.length === 0) {
      const defaultRules = Object.entries(DEFAULT_POINT_RULES).map(
        ([key, rule]) => ({
          key,
          value: rule.value,
          description: rule.description,
        }),
      );
      await PointRule.bulkCreate(defaultRules);
      return defaultRules;
    }
    return rules;
  } catch (error) {
    console.error('Error getting point rules:', error);
    return Object.entries(DEFAULT_POINT_RULES).map(([key, rule]) => ({
      key,
      value: rule.value,
      description: rule.description,
    }));
  }
}

module.exports = {
  getPointRules,
  DEFAULT_POINT_RULES,
};
