const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('STUDENT', 'ADMIN'),
      allowNull: false,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  },
);

module.exports = User;
