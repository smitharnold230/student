const codingStatsService = require('./codingStats.service');

async function submitLeetCode(req, res, next) {
  console.log('[ROUTE] /api/coding-stats/leetcode called');
  try {
    const { url, manualCount } = req.body;
    const stat = await codingStatsService.submitLeetCode(req.user.userId, url, manualCount);
    res.status(201).json({ message: 'LeetCode stats updated', stat });
  } catch (err) {
    if (err.message && err.message.includes('Could not auto-fetch')) {
      return res.status(422).json({ error: err.message, needManual: true });
    }
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await codingStatsService.getStats(req.user.userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { submitLeetCode, getStats };