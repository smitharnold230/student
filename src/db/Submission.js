const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  profileId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  fileUrl: DataTypes.STRING,
  status: DataTypes.STRING,
  verifiedById: DataTypes.UUID,
}, {
  tableName: 'submissions',
  timestamps: true,
});

module.exports = Submission; 