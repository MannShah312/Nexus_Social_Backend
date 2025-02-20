const express = require("express");
const { authenticateUser } = require("../middlewares/auth");
const Community = require("../models/Community");
const Brand = require("../models/Brand");
const CommunityMember = require("../models/CommunityMember");
const User = require("../models/Userdb"); 


const router = express.Router();

// Create Community with image URLs
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { name, brandId, thumbnailUrl, dp } = req.body;

    // Check if brand exists
    const brand = await Brand.findByPk(brandId);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    const community = await Community.create({
      name,
      brandId,
      thumbnailUrl,
      dp,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Community created successfully", community });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/", authenticateUser, async (req, res) => {
    try {
      const communities = await Community.findAll({
        include: [{ model: Brand, attributes: ["name", "thumbnailUrl"] }],
      });
      res.status(200).json({ message: "All communities fetched", communities });
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

// Join a Community
router.post("/:id/join", authenticateUser, async (req, res) => {
    try {
      const { id: communityId } = req.params;
      const userId = req.user.id;
  
      // Check if the community exists
      const community = await Community.findByPk(communityId);
      if (!community) return res.status(404).json({ error: "Community not found" });
  
      // Check if the user is already a member
      const existingMembership = await CommunityMember.findOne({
        where: { userId, communityId },
      });
      if (existingMembership) return res.status(400).json({ error: "Already a member of this community" });
  
      // Add user as a member
      const member = await CommunityMember.create({
        userId,
        communityId,
        role: "member", 
      });
  
      res.status(200).json({
        message: "uccessfully joined the community",
        member,
      });
    } catch (error) {
      console.error("Error joining community:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get("/:id/members", authenticateUser, async (req, res) => {
    try {
      const { id: communityId } = req.params;
  
      // Check if community exists
      const community = await Community.findByPk(communityId);
      if (!community) return res.status(404).json({ error: "Community not found" });
  
      //Fetch all users with their roles
      const members = await CommunityMember.findAll({
        where: { communityId },
        include: [{ model: User, attributes: ["id", "username", "email", "country"] }],
      });
  
      res.status(200).json({
        message: " fetched successfully from the community",
        community: community.name,
        totalMembers: members.length,
        members: members.map((member) => ({
          id: member.User.id,
          username: member.User.username,
          email: member.User.email,
          country: member.User.country,
          role: member.role,
        })),
      });
    } catch (error) {
      console.error("Error fetching community members:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Communities
 *   description: Endpoints for managing communities and their members
 */

  /**
 * @swagger
 * /community:
 *   post:
 *     summary: Create a new community
 *     tags: [Communities]
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
 *               - brandId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nike Fans Club"
 *               brandId:
 *                 type: integer
 *                 example: 1
 *               thumbnailUrl:
 *                 type: string
 *                 example: "https://res.cloudinary.com/demo/image/upload/nike_community.jpg"
 *               dp:
 *                 type: string
 *                 example: "https://res.cloudinary.com/demo/image/upload/nike_dp.jpg"
 *     responses:
 *       201:
 *         description: Community created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Community created successfully"
 *               community:
 *                 id: 1
 *                 name: "Nike Fans Club"
 *                 brandId: 1
 *       404:
 *         description: Brand not found
 */

  /**
 * @swagger
 * /community:
 *   get:
 *     summary: Fetch all communities
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All communities fetched
 *         content:
 *           application/json:
 *             example:
 *               message: "All communities fetched"
 *               communities:
 *                 - id: 1
 *                   name: "Nike Fans Club"
 *                   brand:
 *                     name: "Nike"
 *                     thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/nike.jpg"
 *       500:
 *         description: Internal server error
 */

  /**
 * @swagger
 * /community/{id}/join:
 *   post:
 *     summary: Join a community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the community to join
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully joined the community
 *         content:
 *           application/json:
 *             example:
 *               message: "Successfully joined the community"
 *               member:
 *                 userId: 10
 *                 communityId: 1
 *                 role: "member"
 *       400:
 *         description: Already a member
 *       404:
 *         description: Community not found
 */

  /**
 * @swagger
 * /community/{id}/members:
 *   get:
 *     summary: Fetch all members of a community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the community
 *         example: 1
 *     responses:
 *       200:
 *         description: Members fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Fetched successfully from the community"
 *               community: "Nike Fans Club"
 *               totalMembers: 2
 *               members:
 *                 - id: 10
 *                   username: "jane_doe"
 *                   email: "jane@example.com"
 *                   country: "India"
 *                   role: "member"
 *                 - id: 11
 *                   username: "john_smith"
 *                   email: "john@example.com"
 *                   country: "USA"
 *                   role: "admin"
 *       404:
 *         description: Community not found
 */
