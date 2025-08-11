// Import models to ensure associations are loaded
require('../../db/models');

const Profile = require('../../db/Profile');
const Event = require('../../db/Event');
const EventParticipation = require('../../db/EventParticipation');
const CodingStat = require('../../db/CodingStat');
const User = require('../../db/User'); // Import User model for role check

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

async function assignBatchesForAllEligibleStudents() {
  const students = await User.findAll({
    where: { role: 'STUDENT' },
    include: [{ model: Profile }]
  });

  const results = [];
  for (const student of students) {
    try {
      const eligibility = await checkEligibility(student.id);
      if (eligibility.eligible) {
        // For simplicity, assign to a default batch or implement more complex logic here
        // For now, let's assign to 'PRODUCT' if eligible and not already assigned
        if (!student.Profile.batch) {
          await assignBatch(student.id, 'PRODUCT', false); // Force assign to PRODUCT
          results.push({ userId: student.id, email: student.email, status: 'Batch assigned: PRODUCT' });
        } else {
          results.push({ userId: student.id, email: student.email, status: `Already in batch: ${student.Profile.batch}` });
        }
      } else {
        results.push({ userId: student.id, email: student.email, status: 'Not eligible' });
      }
    } catch (error) {
      console.error(`Error processing batch for student ${student.id}:`, error.message);
      results.push({ userId: student.id, email: student.email, status: `Error: ${error.message}` });
    }
  }
  return results;
}

module.exports = { checkEligibility, assignBatch, assignBatchesForAllEligibleStudents, BATCHES };