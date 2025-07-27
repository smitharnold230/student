const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const EventParticipation = sequelize.define('EventParticipation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  participatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'event_participations',
  timestamps: true,
});

module.exports = EventParticipation; 