// const express = require("express");
// const cors = require ("cors");
// const passport = require ("passport");
// require("dotenv").config();
// require("./config/passport"); 

// const authRoutes = require("./routes/auth");
// const brandRoutes = require("./routes/brand");


// const app = express();
// const port = 4000;

// app.use(cors());
// app.use(express.json());
// app.use(passport.initialize());

// // Routes
// app.use("/auth", authRoutes);
// app.use("/brand", brandRoutes);

// app.get("/", (req, res) => {
//     res.send("Hello World!");
// });

// // Global Error Handler
// app.use((err, req, res, next) => {
//     console.error("Error:", err.stack);
//     res.status(500).json({ error: "Something went wrong!" });
//   });  

// app.listen(port, () => {
//     console.log("Server is running on port : " + port);
// });


const express = require("express");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");
const rateLimit = require("express-rate-limit");

const { swaggerUi, swaggerDocs } = require("./config/swagger");
// Import Routes
const authRoutes = require("./routes/auth");
const brandRoutes = require("./routes/brand");
const brandVideoRoutes = require("./routes/brandUploadVideo");
const videoRoutes = require("./routes/videoRoutes");
const communityRoutes = require("./routes/community");
const groupRoutes = require("./routes/group");

// Import Sequelize and Models
const sequelize = require("./config/database");
const User = require("./models/Userdb");
const Video = require("./models/Video");
const Brand = require("./models/Brand");
const Community = require("./models/Community");
const Group = require("./models/Groups");
const CommunityMember = require("./models/CommunityMember");

// Associations (Relationships)
Brand.hasMany(Community, { foreignKey: "brandId", onDelete: "CASCADE" });
Community.belongsTo(Brand, { foreignKey: "brandId" });

Community.hasMany(Group, { foreignKey: "communityId", onDelete: "CASCADE" });
Group.belongsTo(Community, { foreignKey: "communityId" });

User.hasMany(CommunityMember, { foreignKey: "userId" });
CommunityMember.belongsTo(User, { foreignKey: "userId" });

Community.hasMany(CommunityMember, { foreignKey: "communityId" });
CommunityMember.belongsTo(Community, { foreignKey: "communityId" });

Brand.hasMany(Video, { foreignKey: "brandId" });
Community.hasMany(Video, { foreignKey: "communityId" });
Group.hasMany(Video, { foreignKey: "groupId" });

Video.belongsTo(Brand, { foreignKey: "brandId" });
Video.belongsTo(Community, { foreignKey: "communityId" });
Video.belongsTo(Group, { foreignKey: "groupId" });

User.hasMany(Video, { foreignKey: "uploadedBy" });
Video.belongsTo(User, { foreignKey: "uploadedBy" });

Community.belongsTo(Brand, { foreignKey: "brandId" });
Brand.hasMany(Community, { foreignKey: "brandId" });

const app = express();
const port = process.env.PORT || 4000;
module.exports = app;

// Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many requests from this IP. Try again after 15 minutes.",
});

app.use(globalLimiter);

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/auth", authRoutes);
app.use("/brand", brandRoutes);
app.use("/api", brandVideoRoutes);
app.use("/", videoRoutes);
app.use("/community", communityRoutes);
app.use("/group", groupRoutes);

app.get("/", (req, res) => {
  res.send("Server Running Successfully!");
});

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

sequelize
  .sync({ alter: true }) // Sync models with DB
  .then(() => {
    console.log("Database synchronized successfully.");
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error synchronizing database:", err);
  });