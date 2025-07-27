const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  name: DataTypes.STRING,
  degree: DataTypes.STRING,
  class: DataTypes.STRING,
  status: DataTypes.STRING,
  transport: DataTypes.STRING,
  hostelInfo: DataTypes.STRING,
  batch: DataTypes.STRING,
}, {
  tableName: 'profiles',
  timestamps: true,
});

module.exports = Profile; 