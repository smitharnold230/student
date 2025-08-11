// Import models to ensure associations are loaded
require('../../db/models');

const Profile = require('../../db/Profile');
const Event = require('../../db/Event');
const EventParticipation = require('../../db/EventParticipation');
const CodingStat = require('../../db/CodingStat');

const BATCHES = ['PRODUCT', 'SERVICE_A', 'SERVICE_B', 'SERVICE_C1', 'SERVICE_C2', 'SERVICE_C3'];

async function checkEligibility(userId) {
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) throw new Error('Profile not found');
  // Count workshops attended
  const workshops = await EventParticipation.count({
    include: [{
      model: Event,
      where: { type: 'WORKSHOP' }
    }],
    where: { userId, status: 'CONFIRMED' }
  });
  
  // Count hackathons attended
  const hackathons = await EventParticipation.count({
    include: [{
      model: Event,
      where: { type: 'HACKATHON' }
    }],
    where: { userId, status: 'CONFIRMED' }
  });
  // Get LeetCode problems solved
  const leetcode = await CodingStat.findOne({ where: { profileId: profile.id, platform: 'LEETCODE' } });
  const leetcodeCount = leetcode ? leetcode.problemsSolved : 0;
  const eligible = workshops >= 2 && hackathons >= 2 && leetcodeCount >= 200;
  return { eligible, workshops, hackathons, leetcode: leetcodeCount };
}

async function assignBatch(userId, batch, auto = false) {
  if (!BATCHES.includes(batch)) throw new Error('Invalid batch');
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) throw new Error('Profile not found');
  if (auto) {
    const { eligible } = await checkEligibility(userId);
    if (!eligible) throw new Error('Student not eligible for batch assignment');
  }
  await Profile.update({ batch }, { where: { userId } });
  return { message: `Batch ${batch} assigned` };
}

module.exports = { checkEligibility, assignBatch, BATCHES }; 