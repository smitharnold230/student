const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Profile = sequelize.define('Profile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true },
  name: DataTypes.STRING,
  degree: DataTypes.STRING,
  class: DataTypes.STRING,
  status: DataTypes.STRING,
  transport: DataTypes.STRING,
  hostelInfo: DataTypes.STRING,
  batch: DataTypes.STRING,
}, { tableName: 'profiles', timestamps: true });

const CodingStat = sequelize.define('CodingStat', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  profileId: { type: DataTypes.UUID, allowNull: false },
  platform: DataTypes.STRING,
  url: DataTypes.STRING,
  problemsSolved: DataTypes.INTEGER,
}, { tableName: 'coding_stats', timestamps: true });

const Event = sequelize.define('Event', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: DataTypes.STRING,
  link: DataTypes.STRING,
  date: DataTypes.DATE,
  type: DataTypes.STRING,
  organizer: DataTypes.STRING,
  url: DataTypes.STRING,
}, { tableName: 'events', timestamps: true });

const Submission = sequelize.define('Submission', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  profileId: { type: DataTypes.UUID, allowNull: false },
  eventId: { type: DataTypes.UUID },
  fileUrl: DataTypes.STRING,
  status: DataTypes.STRING,
}, { tableName: 'submissions', timestamps: true });

Profile.hasMany(CodingStat, { foreignKey: 'profileId' });
CodingStat.belongsTo(Profile, { foreignKey: 'profileId' });
Profile.hasMany(Submission, { foreignKey: 'profileId' });
Submission.belongsTo(Profile, { foreignKey: 'profileId' });
Profile.belongsToMany(Event, { through: 'ProfileEvents', foreignKey: 'profileId' });
Event.belongsToMany(Profile, { through: 'ProfileEvents', foreignKey: 'eventId' });

module.exports = { Profile, CodingStat, Event, Submission }; 