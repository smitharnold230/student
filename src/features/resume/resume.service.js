const { Profile, CodingStat, Event, Submission } = require('../../db/ResumeModels');

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