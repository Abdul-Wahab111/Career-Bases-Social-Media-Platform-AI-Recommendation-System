// /routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const {
  createProfile,
  viewOwnProfile,
  updateOwnProfile,
  deleteOwnProfile,
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

// Profile-related routes
router.post("/", protect, createProfile); // Create profile
router.get("/me", protect, viewOwnProfile); // View own profile
router.put("/me", protect, updateOwnProfile); // Update own profile
router.delete("/me", protect, deleteOwnProfile); // Delete own profile

module.exports = router;
