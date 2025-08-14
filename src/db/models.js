const User = require('./User');
const Profile = require('./Profile');
const Event = require('./Event');
const EventParticipation = require('./EventParticipation');
const CodingStat = require('./CodingStat');
const Submission = require('./Submission');
const Point = require('./Point');
const PointRule = require('./PointRule');
const Ticket = require('./Ticket');
const Notification = require('./Notification');
const ApiLog = require('./ApiLog');

// User associations
User.hasOne(Profile, { foreignKey: 'userId' });
Profile.belongsTo(User, { foreignKey: 'userId' });

// Profile associations
Profile.hasOne(Point, { foreignKey: 'profileId' });
Point.belongsTo(Profile, { foreignKey: 'profileId' });

Profile.hasMany(CodingStat, { foreignKey: 'profileId' });
CodingStat.belongsTo(Profile, { foreignKey: 'profileId' });

Profile.hasMany(Submission, { foreignKey: 'profileId' });
Submission.belongsTo(Profile, { foreignKey: 'profileId' });

// Event associations
Event.hasMany(EventParticipation, { foreignKey: 'eventId' });
EventParticipation.belongsTo(Event, { foreignKey: 'eventId' });

Event.hasMany(Submission, { foreignKey: 'eventId' });
Submission.belongsTo(Event, { foreignKey: 'eventId' });

// User-Event associations through EventParticipation
User.hasMany(EventParticipation, { foreignKey: 'userId' });
EventParticipation.belongsTo(User, { foreignKey: 'userId' });

// User associations for other models
User.hasMany(Ticket, { foreignKey: 'userId' });
Ticket.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ApiLog, { foreignKey: 'userId' });
ApiLog.belongsTo(User, { foreignKey: 'userId' });

// Admin associations for verification
User.hasMany(Submission, {
  foreignKey: 'verifiedById',
  as: 'VerifiedSubmissions',
});
Submission.belongsTo(User, { foreignKey: 'verifiedById', as: 'VerifiedBy' });

module.exports = {
  User,
  Profile,
  Event,
  EventParticipation,
  CodingStat,
  Submission,
  Point,
  PointRule,
  Ticket,
  Notification,
  ApiLog,
};
