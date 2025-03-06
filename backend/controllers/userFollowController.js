const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

// @desc    Follow a user
// @route   POST /api/users/follow/:id
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  // Get the IDs of both users
  const userToFollowId = req.params.id;
  const currentUserId = req.user._id;

  // Prevent user from following themselves
  if (userToFollowId.toString() === currentUserId.toString()) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  // Find both users
  const userToFollow = await User.findById(userToFollowId);
  const currentUser = await User.findById(currentUserId);

  if (!userToFollow) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if already following
  if (currentUser.following.includes(userToFollowId)) {
    res.status(400);
    throw new Error("You are already following this user");
  }

  // Add to following list of current user
  await User.findByIdAndUpdate(
    currentUserId,
    {
      $push: { following: userToFollowId }
    },
    { new: true }
  );

  // Add to followers list of user being followed
  await User.findByIdAndUpdate(
    userToFollowId,
    {
      $push: { followers: currentUserId }
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Successfully followed user"
  });
});

// @desc    Unfollow a user
// @route   POST /api/users/unfollow/:id
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  // Get the IDs of both users
  const userToUnfollowId = req.params.id;
  const currentUserId = req.user._id;

  // Find both users
  const userToUnfollow = await User.findById(userToUnfollowId);
  const currentUser = await User.findById(currentUserId);

  if (!userToUnfollow) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if actually following
  if (!currentUser.following.includes(userToUnfollowId)) {
    res.status(400);
    throw new Error("You are not following this user");
  }

  // Remove from following list of current user
  await User.findByIdAndUpdate(
    currentUserId,
    {
      $pull: { following: userToUnfollowId }
    },
    { new: true }
  );

  // Remove from followers list of user being unfollowed
  await User.findByIdAndUpdate(
    userToUnfollowId,
    {
      $pull: { followers: currentUserId }
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Successfully unfollowed user"
  });
});

// @desc    Get a user's followers
// @route   GET /api/users/:id/followers
// @access  Private
const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: "followers",
      select: "name email userimage studentId"
    });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    count: user.followers.length,
    data: user.followers
  });
});

// @desc    Get a user's following list
// @route   GET /api/users/:id/following
// @access  Private
const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: "following",
      select: "name email userimage studentId"
    });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    count: user.following.length,
    data: user.following
  });
});

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};