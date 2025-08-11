const leaderboardService = require('./leaderboard.service');

async function getLeaderboard(req, res, next) {
  try {
    const leaderboard = await leaderboardService.getLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
}

async function getMyRank(req, res, next) {
  try {
    const myRank = await leaderboardService.getMyRank(req.user.userId);
    res.json(myRank);
  } catch (err) {
    next(err);
  }
}

module.exports = { getLeaderboard, getMyRank }; 