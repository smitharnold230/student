const Profile = require('../../db/Profile');
const Event = require('../../db/Event');
const CodingStat = require('../../db/CodingStat');

const BATCHES = ['PRODUCT', 'SERVICE_A', 'SERVICE_B', 'SERVICE_C1', 'SERVICE_C2', 'SERVICE_C3'];

async function checkEligibility(userId) {
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) throw new Error('Profile not found');
  // Count workshops attended
  const workshops = await Event.count({
    where: { type: 'WORKSHOP' },
    include: [{ model: Profile, where: { id: profile.id } }],
  });
  // Count hackathons attended
  const hackathons = await Event.count({
    where: { type: 'HACKATHON' },
    include: [{ model: Profile, where: { id: profile.id } }],
  });
  // Get LeetCode problems solved
  const leetcode = await CodingStat.findOne({ where: { profileId: profile.id, platform: 'LeetCode' } });
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