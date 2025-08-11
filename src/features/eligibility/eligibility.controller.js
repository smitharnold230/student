const eligibilityService = require('./eligibility.service');

async function checkEligibility(req, res, next) {
  try {
    const result = await eligibilityService.checkEligibility(req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function assignBatch(req, res, next) {
  try {
    const { userId, batch, auto } = req.body;
    const result = await eligibilityService.assignBatch(userId, batch, auto);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { checkEligibility, assignBatch }; 