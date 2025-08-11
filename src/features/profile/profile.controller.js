const profileService = require('./profile.service');

async function getProfile(req, res, next) {
  try {
    const profile = await profileService.getProfileByUserId(req.user.userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function requestProfileEdit(req, res, next) {
  try {
    const requestedData = req.body;
    const ticket = await profileService.createEditTicket(req.user.userId, requestedData);
    res.status(201).json({ message: 'Edit request submitted', ticket });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updatedData = req.body;
    await profileService.updateProfileByUserId(req.user.userId, updatedData);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function adminApproveProfileEdit(req, res, next) {
  try {
    const { ticketId } = req.params;
    const { status, adminNote } = req.body;
    const [count, [ticket]] = await profileService.updateTicketStatus(ticketId, status, adminNote);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (status === 'APPROVED') {
      await profileService.updateProfileByUserId(ticket.userId, ticket.requestedData);
    }
    res.json({ message: `Ticket ${status.toLowerCase()}`, ticket });
  } catch (err) {
    next(err);
  }
}

async function getPendingProfileRequests(req, res, next) {
  try {
    const requests = await profileService.getPendingProfileRequests();
    const formattedRequests = requests.map(request => ({
      id: request.id,
      userId: request.userId,
      userEmail: request.user?.email || 'Unknown',
      userName: request.user?.name || 'Unknown',
      requestedData: request.requestedData,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      adminNote: request.adminNote,
    }));
    res.json(formattedRequests);
  } catch (err) {
    next(err);
  }
}

async function getAllStudents(req, res, next) {
  try {
    const students = await profileService.getAllStudents();
    res.json({ data: students });
  } catch (err) {
    next(err);
  }
}

async function uploadProfilePhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const photoUrl = `/uploads/profile_photos/${req.file.filename}`;
    const profile = await profileService.updateProfilePhotoUrl(req.user.userId, photoUrl);
    res.json({ message: 'Profile photo updated successfully', profilePhotoUrl: profile.profilePhotoUrl });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  getProfile, 
  requestProfileEdit, 
  updateProfile, // Added new controller
  adminApproveProfileEdit,
  getPendingProfileRequests,
  getAllStudents,
  uploadProfilePhoto
};