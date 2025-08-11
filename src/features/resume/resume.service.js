const { Profile, CodingStat, Event, Submission } = require('../../db/models');

async function getResumeData(userId) {
  return Profile.findOne({
    where: { userId },
    include: [
      { model: CodingStat },
      { model: Submission },
      { model: Event },
    ],
  });
}

module.exports = { getResumeData };