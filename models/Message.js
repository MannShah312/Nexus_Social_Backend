const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Group = require("./Groups");
const User = require("./Userdb");

const Message = sequelize.define("Message", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, references: { model: User, key: "id" } },
  groupId: { type: DataTypes.INTEGER, references: { model: Group, key: "id" } },
  content: { type: DataTypes.TEXT, allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Message;