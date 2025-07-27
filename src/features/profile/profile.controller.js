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

module.exports = { 
  getProfile, 
  requestProfileEdit, 
  adminApproveProfileEdit,
  getPendingProfileRequests
}; 