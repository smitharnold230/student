const Profile = require('../../db/Profile');
const Submission = require('../../db/Submission');

async function uploadCertification(userId, eventId, fileUrl) {
  try {
    console.log('Uploading certification:', { userId, eventId, fileUrl });
    
    // Get or create profile
    const profileService = require('../profile/profile.service');
    const profile = await profileService.getProfileByUserId(userId);
    
    console.log('Found/created profile:', profile.id);
    
    const submission = await Submission.create({
      profileId: profile.id,
      eventId,
      fileUrl,
      status: 'PENDING',
    });
    
    console.log('Submission created successfully:', submission.id);
    return submission;
  } catch (error) {
    console.error('Error in uploadCertification:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

async function getPendingCertifications() {
  return Submission.findAll({
    where: { status: 'PENDING' },
    include: [Profile],
  });
}

async function getUserCertifications(userId) {
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) return [];
  
  return Submission.findAll({
    where: { profileId: profile.id },
    include: [Profile],
    order: [['createdAt', 'DESC']],
  });
}

async function verifyCertification(submissionId, status, adminId) {
  return Submission.update(
    { status, verifiedById: adminId },
    { where: { id: submissionId }, returning: true }
  );
}

module.exports = { uploadCertification, getPendingCertifications, getUserCertifications, verifyCertification }; 