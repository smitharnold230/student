const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  link: DataTypes.STRING,
  date: DataTypes.DATE,
  type: {
    type: DataTypes.ENUM('WORKSHOP', 'HACKATHON'),
    allowNull: false,
  },
  organizer: DataTypes.STRING,
  url: DataTypes.STRING,
  certificationDeadline: DataTypes.DATE,
}, {
  tableName: 'events',
  timestamps: true,
});

module.exports = Event; 