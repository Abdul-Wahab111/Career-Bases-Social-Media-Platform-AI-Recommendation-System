const express = require("express");
const router = express.Router();
const { followUser, unfollowUser, getFollowers, getFollowing } = require("../controllers/userFollowController.js");
const { protect } = require("../middleware/authMiddleware");


// Follow a user
router.post("/follow/:id", protect, followUser);

// Unfollow a user
router.post("/unfollow/:id", protect, unfollowUser);

// Get a user's followers
router.get("/:id/followers", protect, getFollowers);

// Get a user's following list
router.get("/:id/following", protect, getFollowing);

module.exports = router;