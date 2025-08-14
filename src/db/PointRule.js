const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const PointRule = sequelize.define(
  'PointRule',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: DataTypes.STRING,
  },
  {
    tableName: 'point_rules',
    timestamps: false,
  },
);

module.exports = PointRule;
