const express = require("express");
const { authenticateUser } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const Video = require("../models/Video");
const Brand = require("../models/Brand");

const router = express.Router();

// Upload Video for a Brand
router.post("/brand/:brandId/video", authenticateUser, upload.single("video"), async (req, res) => {
  try {
    const { brandId } = req.params;
    const { title, description } = req.body;

    // Check if brand exists
    const brand = await Brand.findByPk(brandId);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    // Cloudinary video URL from file upload
    const videoUrl = req.file.path;

    // Create video record in DB
    const video = await Video.create({
      title,
      description,
      url: videoUrl,
      brandId,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      message: "Video uploaded successfully for the brand!",
      video,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;