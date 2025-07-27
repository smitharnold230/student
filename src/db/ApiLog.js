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
}, {
  tableName: 'api_logs',
  timestamps: false,
});

module.exports = ApiLog; 