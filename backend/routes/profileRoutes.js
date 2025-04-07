// /routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const {
  createOrUpdateProfile,
  viewOwnProfile,
  updateOwnProfile,
  deleteOwnProfile,
  viewAllProfiles, // New controller function
  getProfileByUserId
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

// Profile-related routes
router.post("/", protect, createOrUpdateProfile); // Create profile
router.get("/me", protect, viewOwnProfile); // View own profile
router.put("/me", protect, updateOwnProfile); // Update own profile
router.delete("/me", protect, deleteOwnProfile); // Delete own profile
router.get("/", protect, viewAllProfiles); // View all profiles (NEW)
router.get("/user/:userId", protect, getProfileByUserId); // NEW: Get profile by user ID

module.exports = router;
