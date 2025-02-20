const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Community = require("./Community");

const Group = sequelize.define("Group", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  dp: { type: DataTypes.STRING }, 
  communityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Community,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  videoCount: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Group;