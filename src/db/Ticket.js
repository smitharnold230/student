const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  requestedData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
  },
  adminNote: DataTypes.STRING,
}, {
  tableName: 'tickets',
  timestamps: true,
});

module.exports = Ticket; 