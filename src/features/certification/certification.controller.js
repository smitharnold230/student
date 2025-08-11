const certificationService = require('./certification.service');
const notificationService = require('../notification/notification.service');

async function uploadCertification(req, res, next) {
  try {
    const { eventId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/certifications/${req.file.filename}`;
    const submission = await certificationService.uploadCertification(req.user.userId, eventId, fileUrl);
    
    try {
      await notificationService.deleteNotificationByEventId(req.user.userId, eventId, 'CERTIFICATION_REMINDER');
    } catch (notificationError) {
      console.error('Failed to delete notification:', notificationError);
    }
    
    res.status(201).json({ message: 'Certification uploaded', submission });
  } catch (err) {
    next(err);
  }
}

async function getPendingCertifications(req, res, next) {
  try {
    const pending = await certificationService.getPendingCertifications();
    res.json(pending);
  } catch (err) {
    next(err);
  }
}

async function getUserCertifications(req, res, next) {
  try {
    const userCertifications = await certificationService.getUserCertifications(req.user.userId);
    res.json(userCertifications);
  } catch (err) {
    next(err);
  }
}

async function verifyCertification(req, res, next) {
  try {
    const { submissionId } = req.params;
    const { status } = req.body;
    const updated = await certificationService.verifyCertification(submissionId, status, req.user.userId);
    res.json({ message: `Certification ${status.toLowerCase()}`, submission: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadCertification, getPendingCertifications, getUserCertifications, verifyCertification };