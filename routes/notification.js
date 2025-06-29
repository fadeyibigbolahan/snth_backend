const express = require("express");
const Notification = require("../models/Notification");
const { authMiddleware } = require("../controllers/auth/auth-controller");
const router = express.Router();

// Fetch notifications for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in req.user
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

module.exports = router;
