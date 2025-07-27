const resumeService = require('./resume.service');

async function generateResume(req, res, next) {
  try {
    const profile = await resumeService.getResumeData(req.user.userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ resumeData: profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateResume }; 