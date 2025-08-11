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
  // Removed progression field - only using batches
  manualAdjustment: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Manual points added/subtracted by admin'
  },
}, {
  tableName: 'points',
  timestamps: true,
});

module.exports = Point; 