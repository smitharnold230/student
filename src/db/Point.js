const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Point = sequelize.define('Point', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  profileId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  progression: DataTypes.STRING,
}, {
  tableName: 'points',
  timestamps: true,
});

module.exports = Point; 