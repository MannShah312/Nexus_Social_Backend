const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Brand = sequelize.define("Brand", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  website: { type: DataTypes.STRING },
  primaryColor: { type: DataTypes.STRING },
  secondaryColor: { type: DataTypes.STRING },
  thumbnailUrl: { type: DataTypes.STRING }, // Cloudinary URL for brand image
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
});

module.exports = Brand;