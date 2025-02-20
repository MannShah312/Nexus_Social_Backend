const express = require("express");
const { authenticateUser } = require("../middlewares/auth");
const Video = require("../models/Video");
const Brand = require("../models/Brand");
const User = require("../models/Userdb");
const { Op } = require("sequelize");
const redis = require("../config/redis");

const router = express.Router();

router.get("/brands/videos/top", authenticateUser, async (req, res) => {
  try {
    const brands = await Brand.findAll({
      attributes: [
        "id",
        "name",
        "thumbnailUrl",
        [Video.sequelize.fn("SUM", Video.sequelize.col("views")), "totalViews"],
      ],
      include: [{ model: Video, attributes: [] }],
      group: ["Brand.id"],
      order: [[Video.sequelize.literal("totalViews"), "DESC"]],
    });

    res.status(200).json({ message: "Brands sorted by total video views", brands });
  } catch (error) {
    console.error("Error fetching top brands:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Top videos by views for a brand
router.get("/brands/videos/top", authenticateUser, async (req, res) => {
  try {
    const { brand_id } = req.query;
    if (!brand_id) return res.status(400).json({ error: "brand_id is required" });

    const videos = await Video.findAll({
      where: { brandId: brand_id },
      order: [["views", "DESC"]],
      include: [{ model: User, attributes: ["username", "email"] }],
    });

    res.status(200).json({ message: "Top videos for brand fetched successfully", videos });
  } catch (error) {
    console.error("Error fetching top videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Most recent videos (brandId optional)
router.get("/recent", authenticateUser, async (req, res) => {
  try {
    const { brand_id } = req.query;
    const condition = brand_id ? { brandId: brand_id } : {};

    const videos = await Video.findAll({
      where: condition,
      order: [["createdAt", "DESC"]],
      limit: 10, // Latest 10 videos
      include: [{ model: User, attributes: ["username"] }],
    });

    res.status(200).json({ message: "Recent videos fetched successfully", videos });
  } catch (error) {
    console.error("Error fetching recent videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// // videos/highlights?brand_id={brand_id} - Most discussed video for a brand
// router.get("/highlights", authenticateUser, async (req, res) => {
//   try {
//     const { brand_id } = req.query;
//     const condition = brand_id ? { brandId: brand_id } : {};

//     const videos = await Video.findAll({
//       where: condition,
//       attributes: {
//         include: [
//           [Video.sequelize.fn("COUNT", Video.sequelize.col("Comments.id")), "commentCount"],
//         ],
//       },
//       include: [
//         { model: Comment, attributes: [] },
//         { model: User, attributes: ["username"] },
//       ],
//       group: ["Video.id"],
//       order: [[Video.sequelize.literal("commentCount"), "DESC"]],
//       limit: 1,
//     });

//     res.status(200).json({
//       message: "Most discussed video fetched successfully",
//       highlight: videos[0] || null,
//     });
//   } catch (error) {
//     console.error("Error fetching highlight video:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

router.get("/top", async (req, res) => {
  try {
    const cacheKey = "top_videos";

    // Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Fetch from DB
    const topVideos = await Video.findAll({
      order: [["views", "DESC"]],
      limit: 10, // Adjust as needed
    });

    // Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(topVideos), "EX", 3600);

    res.json(topVideos);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/recent", async (req, res) => {
  try {
    const cacheKey = "recentVideos";

    // Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Fetch from DB if not cached
    const recentVideos = await Video.findAll({
      order: [["createdAt", "DESC"]], // Get latest videos
      limit: 10, // Adjust limit as needed
    });

    // Save in Redis cache for 10 minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(recentVideos));

    res.json({ recentVideos });
  } catch (error) {
    console.error("Error fetching recent videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


  /**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Endpoints for managing and retrieving video-related data
 */

/**
 * @swagger
 * /videos/brands/videos/top:
 *   get:
 *     summary: Retrieve brands sorted by the highest total video views (descending order)
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Brands sorted by total video views
 *         content:
 *           application/json:
 *             example:
 *               message: "Brands sorted by total video views"
 *               brands:
 *                 - id: 1
 *                   name: "Nike"
 *                   thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/nike.jpg"
 *                   totalViews: 150000
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /videos/brands/videos/top:
 *   get:
 *     summary: Retrieve the top videos by views for a specific brand
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: brand_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the brand
 *         example: 1
 *     responses:
 *       200:
 *         description: Top videos fetched successfully for the brand
 *         content:
 *           application/json:
 *             example:
 *               message: "Top videos for brand fetched successfully"
 *               videos:
 *                 - id: 101
 *                   title: "Nike Air Commercial"
 *                   views: 12000
 *                   uploadedBy:
 *                     username: "john_doe"
 *                     email: "john@example.com"
 *       400:
 *         description: brand_id is required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /videos/recent:
 *   get:
 *     summary: Retrieve the most recent videos (brandId optional) with Redis caching
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: integer
 *         description: Optional brand ID to filter videos
 *         example: 1
 *     responses:
 *       200:
 *         description: Recent videos fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Recent videos fetched successfully"
 *               recentVideos:
 *                 - id: 202
 *                   title: "New Sneaker Launch"
 *                   createdAt: "2024-02-21T10:20:30Z"
 *                   uploadedBy:
 *                     username: "jane_doe"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /videos/top:
 *   get:
 *     summary: Retrieve the top videos overall by views (cached with Redis)
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: Top videos fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               - id: 301
 *                 title: "Top Trending Video"
 *                 views: 25000
 *                 createdAt: "2024-02-20T15:45:10Z"
 *       500:
 *         description: Server error
 */