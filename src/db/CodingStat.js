const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const CodingStat = sequelize.define(
  'CodingStat',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    profileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    platform: DataTypes.STRING,
    url: DataTypes.STRING,
    problemsSolved: DataTypes.INTEGER,
  },
  {
    tableName: 'coding_stats',
    timestamps: true,
  },
);

module.exports = CodingStat;
