const sequelize = require("./config/database");
const User = require("./models/Userdb");
const Brand = require("./models/Brand");
const Community = require("./models/Community");
const Group = require("./models/Groups");
const Video = require("./models/Video");
const Message = require("./models/Message");
const GroupMember = require("./models/GroupMember");
const CommunityMember = require("./models/CommunityMember");

async function syncDB() {
  try {
    await sequelize.sync({ force: true }); // Deletes existing tables and recreates them
    console.log("✅ Database synced successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    process.exit(1);
  }
}

syncDB();