const codingStatsService = require('./codingStats.service');

async function submitLeetCode(req, res, next) {
  try {
    const { url } = req.body;
    const stat = await codingStatsService.submitLeetCode(req.user.userId, url);
    res.status(201).json({ message: 'LeetCode stats updated', stat });
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch LeetCode stats')) {
      return res.status(422).json({ error: err.message, needManual: true });
    }
    next(err);
  }
}

async function submitHackerRank(req, res, next) {
  try {
    const { url, manualCount } = req.body;
    const stat = await codingStatsService.submitHackerRank(
      req.user.userId,
      url,
      manualCount,
    );
    res.status(201).json({ message: 'HackerRank stats updated', stat });
  } catch (err) {
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

async function deleteStat(req, res, next) {
  try {
    const { platform } = req.params; // Get platform from URL params
    const result = await codingStatsService.deleteCodingStat(
      req.user.userId,
      platform,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { submitLeetCode, submitHackerRank, getStats, deleteStat };
