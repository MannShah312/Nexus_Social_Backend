const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Brand = require("./Brand");

const Community = sequelize.define("Community", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  thumbnailUrl: { type: DataTypes.STRING }, // Cloudinary URL for community image
  dp: { type: DataTypes.STRING }, // Display picture
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Brand,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Community;