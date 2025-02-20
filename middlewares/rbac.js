const express = require("express");
const { authenticateUser } = require("../middlewares/auth");

const router = express.Router();

// Protected route
router.get("/profile", authenticateUser, (req, res) => {
  res.status(200).json({ message: "User Profile", user: req.user });
});

module.exports = router;
