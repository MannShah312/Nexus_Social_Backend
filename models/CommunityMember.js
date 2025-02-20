const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./Userdb");
const Community = require("./Community");

const CommunityMember = sequelize.define("CommunityMember", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: User, key: "id" },
    onDelete: "CASCADE"
  },
  communityId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: Community, key: "id" },
    onDelete: "CASCADE"
  },
  role: { type: DataTypes.ENUM("admin", "member"), defaultValue: "member" },
});

module.exports = CommunityMember;
