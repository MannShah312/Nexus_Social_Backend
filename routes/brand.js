const express = require("express");
const Brand = require("../models/Brand");
const { authenticateUser } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const Video = require("../models/Video");
const User = require("../models/Userdb");

const router = express.Router();

// Create a Brand
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { name, website, primaryColor, secondaryColor, thumbnailUrl, username } = req.body;

    // Check if username already exists
    const existingBrand = await Brand.findOne({ where: { username } });
    if (existingBrand) return res.status(409).json({ error: "Username already taken." });

    const brand = await Brand.create({ name, website, primaryColor, secondaryColor, thumbnailUrl, username });
    res.status(201).json({ message: "Brand created successfully", brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get All Brands
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Brand by ID
router.get("/:id", async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    res.status(200).json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a Brand
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const { name, website, primaryColor, secondaryColor, thumbnailUrl } = req.body;
    const brand = await Brand.findByPk(req.params.id);

    if (!brand) return res.status(404).json({ error: "Brand not found" });

    await brand.update({ name, website, primaryColor, secondaryColor, thumbnailUrl });
    res.status(200).json({ message: "Brand updated successfully", brand });
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a Brand
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: "Brand not found" })

    await brand.destroy();
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// // Upload Video for a Specific Brand
// router.post("/:id/video", authenticateUser, upload.single("video"), async (req, res) => {
//   try {
//     const { title, description } = req.body;
//     const { id: brandId } = req.params;

//     // Check if brand exists
//     const brand = await Brand.findByPk(brandId);
//     if (!brand) return res.status(404).json({ error: "Brand not found" });

//     // Cloudinary URL from uploaded fil.
//     const videoUrl = req.file.path || req.file.url;

//     // Save video details in the database
//     const video = await Video.create({
//       title,
//       description,
//       url: videoUrl,
//       brandId,
//       communityId: null, // Since this is a brand-level upload
//       groupId: null,
//       uploadedBy: req.user.id, // User uploading the video
//     });

//     res.status(201).json({
//       message: "Video uploaded successfully",
//       video,
//     });
//   } catch (error) {
//     console.error("Error uploading video:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// Fetch All Videos for a Specific Brand with Pagination
router.get("/:id/videos", authenticateUser, async (req, res) => {
  try {
    const { id: brandId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if brand exists
    const brand = await Brand.findByPk(brandId);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    // Fetch videos with pagination
    const videos = await Video.findAndCountAll({
      where: { brandId },
      include: [{ model: User, attributes: ["id", "username", "email"] }],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Videos fetched successfully",
      totalVideos: videos.count,
      totalPages: Math.ceil(videos.count / limit),
      currentPage: page,
      videos: videos.rows,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/video", authenticateUser, upload.single("video"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const { id: brandId } = req.params;

    // Check if brand exists
    const brand = await Brand.findByPk(brandId);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    // ✅ Check req.file structure
    console.log("Uploaded file details:", req.file);

    if (!req.file) return res.status(400).json({ error: "No video file uploaded" });

    // Check if req.file.path or req.file.url exists
    const videoUrl = req.file.path || req.file.url;

    if (!videoUrl) return res.status(500).json({ error: "Video URL not found after upload" });

    // Save video details in the database
    const video = await Video.create({
      title,
      description,
      url: videoUrl,
      brandId,
      communityId: null,
      groupId: null,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      video,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/top", async (req, res) => {
  try {
    const cacheKey = "topBrands";

    // Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Fetch from DB if not cached
    const topBrands = await Brand.findAll({
      attributes: ["id", "name", [Sequelize.fn("SUM", Sequelize.col("videos.views")), "totalViews"]],
      include: [
        {
          model: Video,
          attributes: [],
        },
      ],
      group: ["Brand.id"],
      order: [[Sequelize.literal("totalViews"), "DESC"]],
      limit: 5, // Get top 5 brands
    });

    // Save in Redis cache for 10 minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(topBrands));

    res.json({ topBrands });
  } catch (error) {
    console.error("Error fetching top brands:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: API endpoints for managing brands and videos
 */

/**
 * @swagger
 * /brand:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - website
 *               - username
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nike"
 *               website:
 *                 type: string
 *                 example: "https://www.nike.com"
 *               primaryColor:
 *                 type: string
 *                 example: "#000000"
 *               secondaryColor:
 *                 type: string
 *                 example: "#FFFFFF"
 *               thumbnailUrl:
 *                 type: string
 *                 example: "https://res.cloudinary.com/demo/image/upload/nike.jpg"
 *               username:
 *                 type: string
 *                 example: "Nike_official"
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       409:
 *         description: Username already taken
 */

/**
 * @swagger
 * /brand:
 *   get:
 *     summary: Fetch all brands
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: List of brands
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Nike"
 *                 website: "https://www.nike.com"
 *                 username: "Nike_official"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /brand/{id}:
 *   get:
 *     summary: Fetch a single brand by ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Brand found
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /brand/{id}:
 *   put:
 *     summary: Update an existing brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nike Updated"
 *               website:
 *                 type: string
 *                 example: "https://www.nike-updated.com"
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /brand/{id}:
 *   delete:
 *     summary: Delete a brand by ID
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /brand/{id}/video:
 *   post:
 *     summary: Upload a video for a specific brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - video
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Nike Commercial"
 *               description:
 *                 type: string
 *                 example: "Latest Nike ad campaign"
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /brand/{id}/videos:
 *   get:
 *     summary: Fetch all videos for a brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Videos fetched successfully
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /brand/top:
 *   get:
 *     summary: Fetch top brands based on video views
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: Top brands fetched successfully
 *       500:
 *         description: Internal server error
 */
