const Profile = require('../../db/Profile');
const Submission = require('../../db/Submission');
const Event = require('../../db/Event');
const pointsService = require('../points/points.service');

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
  try {
    // Try with include first
    try {
      return await Submission.findAll({
        where: { status: 'PENDING' },
        include: [Profile],
      });
    } catch (includeError) {
      console.log('Include failed, trying without include:', includeError.message);
      // If include fails, try without it
      return await Submission.findAll({
        where: { status: 'PENDING' },
      });
    }
  } catch (error) {
    console.error('Error in getPendingCertifications:', error);
    return [];
  }
}

async function getUserCertifications(userId) {
  try {
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) return [];
    
    // Try with include first
    try {
      return await Submission.findAll({
        where: { profileId: profile.id },
        include: [Profile],
        order: [['createdAt', 'DESC']],
      });
    } catch (includeError) {
      console.log('Include failed, trying without include:', includeError.message);
      // If include fails, try without it
      return await Submission.findAll({
        where: { profileId: profile.id },
        order: [['createdAt', 'DESC']],
      });
    }
  } catch (error) {
    console.error('Error in getUserCertifications:', error);
    return [];
  }
}

async function verifyCertification(submissionId, status, adminId) {
  const submission = await Submission.findByPk(submissionId, {
    include: [Profile, { model: Event }]
  });
  
  if (!submission) {
    throw new Error('Submission not found');
  }
  
  const result = await Submission.update(
    { status, verifiedById: adminId },
    { where: { id: submissionId }, returning: true }
  );
  
  // Add points if certification is approved
  if (status === 'APPROVED' && submission.Profile && submission.Profile.userId) {
    try {
      await pointsService.addPointsForActivity(
        submission.Profile.userId, 
        'CERTIFICATION_APPROVED', 
        { eventName: submission.Event?.name || 'Unknown event' }
      );
      console.log(`Points added for approved certification for user ${submission.Profile.userId}`);
    } catch (error) {
      console.error('Error adding points for approved certification:', error);
      // Don't fail the verification if points fail
    }
  }
  
  return result;
}

module.exports = { uploadCertification, getPendingCertifications, getUserCertifications, verifyCertification }; 