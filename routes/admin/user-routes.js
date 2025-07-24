const express = require("express");

const {
  getAllUsers,
  deleteUser,
} = require("../../controllers/admin/user-controller");

const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

// Route to get all users
router.get("/", authMiddleware, getAllUsers);

// Route to delete a user
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
