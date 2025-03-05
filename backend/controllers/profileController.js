// /controllers/profileController.js
const asyncHandler = require("express-async-handler");
const Profile = require("../models/profileModel");

// @desc    Create user profile
// @route   POST /api/profiles
// @access  Private
const createProfile = asyncHandler(async (req, res) => {
  const existingProfile = await Profile.findOne({ user: req.user.id });

  if (existingProfile) {
    res.status(400);
    throw new Error("Profile already exists");
  }

  const { bio, skills, education } = req.body;

  const profile = await Profile.create({
    user: req.user.id,
    bio,
    skills,
    education,
  });

  res.status(201).json(profile);
});

// @desc    View own profile
// @route   GET /api/profiles/me
// @access  Private
const viewOwnProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id }).populate(
    "user",
    "name email"
  );

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  res.json(profile);
});

// @desc    Update own profile
// @route   PUT /api/profiles/me
// @access  Private
const updateOwnProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  const { bio, skills, education } = req.body;

  profile.bio = bio || profile.bio;
  profile.skills = skills || profile.skills;
  profile.education = education || profile.education;

  const updatedProfile = await profile.save();
  res.json(updatedProfile);
});

// @desc    Delete own profile
// @route   DELETE /api/profiles/me
// @access  Private
const deleteOwnProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  await profile.deleteOne();
  res.json({ message: "Profile deleted successfully" });
});

module.exports = {
  createProfile,
  viewOwnProfile,
  updateOwnProfile,
  deleteOwnProfile,
};
