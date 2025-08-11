const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: DataTypes.STRING,
  title: DataTypes.STRING,
  message: DataTypes.STRING,
  eventId: DataTypes.UUID,
  deadline: DataTypes.DATE,
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
});

module.exports = Notification; 