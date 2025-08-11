const Profile = require('../../db/Profile');
const Submission = require('../../db/Submission');
const Event = require('../../db/Event');
const pointsService = require('../points/points.service');

async function uploadCertification(userId, eventId, fileUrl) {
  try {
    const profileService = require('../profile/profile.service');
    const profile = await profileService.getProfileByUserId(userId);
    
    const submission = await Submission.create({
      profileId: profile.id,
      eventId,
      fileUrl,
      status: 'PENDING',
    });
    
    return submission;
  } catch (error) {
    console.error('Error in uploadCertification:', error);
    throw error;
  }
}

async function getPendingCertifications() {
  try {
    return await Submission.findAll({
      where: { status: 'PENDING' },
      include: [{
        model: Profile,
        attributes: ['name', 'class', 'batch', 'userId'],
        include: [{
          model: require('../../db/User'), // Include User to get email
          attributes: ['email']
        }]
      }, {
        model: Event,
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']]
    });
  } catch (error) {
    console.error('Error in getPendingCertifications:', error);
    return [];
  }
}

async function getUserCertifications(userId) {
  try {
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) return [];
    
    return await Submission.findAll({
      where: { profileId: profile.id },
      include: [{
        model: Event,
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']],
    });
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
  
  if (status === 'APPROVED' && submission.Profile && submission.Profile.userId) {
    try {
      await pointsService.addPointsForActivity(
        submission.Profile.userId, 
        'CERTIFICATION_APPROVED', 
        { eventName: submission.Event?.name || 'Unknown event' }
      );
    } catch (error) {
      console.error('Error adding points for approved certification:', error);
    }
  }
  
  return result;
}

module.exports = { uploadCertification, getPendingCertifications, getUserCertifications, verifyCertification };