const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/Userdb");
const { generateToken } = require("../utils/jwtHelpers");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many login/signup attempts. Please try again after 15 minutes.",
});

// Updated User Registration API (with additional fields)
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { username, email, phone, password, age, gender, dp, country } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(403).json({ error: "Email already in use" });

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) return res.status(403).json({ error: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      phone,
      password: hashedPassword,
      age,
      gender,
      dp,       
      country,
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        age: newUser.age,
        gender: newUser.gender,
        dp: newUser.dp,
        country: newUser.country,
      },
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(403).json({ error: "User not found" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(403).json({ error: "Invalid password" });

    // 🎟 Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        dp: user.dp,
        country: user.country,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: jane_doe
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *               age:
 *                 type: integer
 *                 example: 28
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: female
 *               dp:
 *                 type: string
 *                 example: "https://res.cloudinary.com/demo/image/upload/v12345/dp/janedoe.jpg"
 *               country:
 *                 type: string
 *                 example: India
 *     responses:
 *       201:
 *         description: ✅ User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "✅ User registered successfully"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: ❌ Missing required fields
 *         content:
 *           application/json:
 *             example:
 *               error: "❌ Email is required"
 *       403:
 *         description: ⚠️ User already exists
 *         content:
 *           application/json:
 *             example:
 *               error: "⚠️ User already exists"
 */


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: ✅ Login successful
 *         content:
 *           application/json:
 *             example:
 *               message: "✅ Login successful"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       403:
 *         description: ❌ Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid email or password"
 */