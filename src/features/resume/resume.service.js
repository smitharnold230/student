const { Profile, CodingStat, Submission, Event } = require('../../db/models');

async function getResumeData(userId) {
  return Profile.findOne({
    where: { userId },
    include: [
      { model: CodingStat },
      {
        model: Submission,
        include: [{ model: Event }], // Correctly include Event through Submission
      },
    ],
  });
}

module.exports = { getResumeData };
