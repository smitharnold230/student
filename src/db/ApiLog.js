const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const ApiLog = sequelize.define('ApiLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: DataTypes.UUID,
  method: DataTypes.STRING,
  endpoint: DataTypes.STRING,
  status: DataTypes.INTEGER,
  requestBody: DataTypes.JSON,
  responseBody: DataTypes.JSON,
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  responseTime: { // New field
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ipAddress: { // New field
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: { // New field
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'api_logs',
  timestamps: false,
});

module.exports = ApiLog;