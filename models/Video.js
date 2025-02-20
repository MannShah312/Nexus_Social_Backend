const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Brand = require("./Brand");
const Community = require("./Community");
const Group = require("./Groups");
const User = require("./Userdb");

const Video = sequelize.define("Video", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  url: { type: DataTypes.STRING, allowNull: false },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  brandId: {
    type: DataTypes.INTEGER,
    references: {
      model: Brand,
      key: "id",
    },
    onDelete: "SET NULL",
  },
  communityId: {
    type: DataTypes.INTEGER,
    references: {
      model: Community,
      key: "id",
    },
    onDelete: "SET NULL",
  },
  groupId: {
    type: DataTypes.INTEGER,
    references: {
      model: Group,
      key: "id",
    },
    onDelete: "SET NULL",
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Video;