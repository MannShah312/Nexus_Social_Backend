const express = require("express");
const { authenticateUser } = require("../middlewares/auth");
const Group = require("../models/Groups");
const Community = require("../models/Community");
const GroupMember = require("../models/GroupMember");
const User = require("../models/Userdb");
const redis = require("../config/redis");

const router = express.Router();

// Create Group
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { name, communityId } = req.body;

    // Check if community exists
    const community = await Community.findByPk(communityId);
    if (!community) return res.status(404).json({ error: "Community not found" });

    const group = await Group.create({
      name,
      communityId,
      videoCount: 0,
      createdBy: req.user.id,
    });

    // Add creator as admin
    await GroupMember.create({
      userId: req.user.id,
      groupId: group.id,
      role: "admin",
    });

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get All Groups
router.get("/", authenticateUser, async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [{ model: Community, attributes: ["name"] }],
    });
    res.status(200).json({ message: "All groups fetched", groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Join Group
router.post("/:id/join", authenticateUser, async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Prevent duplicate membership
    const existingMembership = await GroupMember.findOne({
      where: { userId, groupId },
    });
    if (existingMembership) return res.status(400).json({ error: "Already a member of this group" });

    // Add user as member
    const member = await GroupMember.create({
      userId,
      groupId,
      role: "member",
    });

    res.status(200).json({ message: "Successfully joined the group", member });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get All Users in a Group
router.get("/:id/members", authenticateUser, async (req, res) => {
  try {
    const { id: groupId } = req.params;

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Fetch members
    const members = await GroupMember.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ["id", "username", "email", "country"] }],
    });

    res.status(200).json({
      message: "Users fetched successfully from the group",
      group: group.name,
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
    console.error("Error fetching group members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Redis for the Recent Group Task

router.get("/recent", async (req, res) => {
  try {
    const cacheKey = "recent_groups";

    // Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Fetch from DB
    const recentGroups = await Group.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10, // Adjust limit as needed
    });

    // Cache data for 1 hour
    await redis.set(cacheKey, JSON.stringify(recentGroups), "EX", 3600);

    res.json(recentGroups);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Endpoints for managing groups and group members
 */

/**
 * @swagger
 * /group:
 *   post:
 *     summary: Create a new group under a community
 *     tags: [Groups]
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
 *               - communityId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tech Enthusiasts"
 *               communityId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Group created successfully"
 *               group:
 *                 id: 1
 *                 name: "Tech Enthusiasts"
 *                 communityId: 1
 *       404:
 *         description: Community not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /group:
 *   get:
 *     summary: Retrieve all groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All groups fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "All groups fetched"
 *               groups:
 *                 - id: 1
 *                   name: "Tech Enthusiasts"
 *                   community:
 *                     name: "Programming Hub"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /group/{id}/join:
 *   post:
 *     summary: Join a specific group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the group to join
 *         example: 1
 *     responses:
 *       200:
 *         description: ✅ Successfully joined the group
 *         content:
 *           application/json:
 *             example:
 *               message: "Successfully joined the group"
 *               member:
 *                 userId: 10
 *                 groupId: 1
 *                 role: "member"
 *       400:
 *         description: Already a member of this group
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /group/recent:
 *   get:
 *     summary: Retrieve the most recently created groups (cached with Redis)
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: Recently created groups fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Tech Enthusiasts"
 *                 communityId: 1
 *                 createdAt: "2024-02-21T10:20:30Z"
 *               - id: 2
 *                 name: "AI Innovators"
 *                 communityId: 2
 *                 createdAt: "2024-02-20T15:45:10Z"
 *       500:
 *         description: Server error
 */
