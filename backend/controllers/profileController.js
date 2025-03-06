const asyncHandler = require("express-async-handler");
const Profile = require("../models/profileModel");
const User = require("../models/userModel");

// @desc    Create user profile
// @route   POST /api/profiles
// @access  Private
const createProfile = asyncHandler(async (req, res) => {
  try {
    console.log("Creating profile with data:", req.body);
    console.log("User ID:", req.user.id);
    
    const existingProfile = await Profile.findOne({ user: req.user.id });

    if (existingProfile) {
      res.status(400);
      throw new Error("Profile already exists");
    }

    const { bio, skills, education, courses, interests, userimage, achievements } = req.body;

    const profileData = {
      user: req.user.id,
      bio: bio || "",
      skills: skills || [],
      education: education || "",
      courses: courses || [],
      interests: interests || [],
      userimage: userimage || "",
      achievements: achievements || [],
    };

    console.log("Processed profile data:", profileData);
    
    const profile = await Profile.create(profileData);

    // Update the user's image field with the same userimage
    if (userimage) {
      await User.findByIdAndUpdate(req.user.id, { userimage });
    }
    
    res.status(201).json(profile);
  } catch (error) {
    console.error("Profile creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    View own profile
// @route   GET /api/profiles/me
// @access  Private
const viewOwnProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'name email image');

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  res.status(200).json(profile);
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

  const { bio, skills, education, courses, interests, userimage, achievements } = req.body;

  profile.bio = bio || profile.bio;
  profile.skills = skills || profile.skills;
  profile.education = education || profile.education;
  profile.courses = courses || profile.courses;
  profile.interests = interests || profile.interests;
  profile.achievements = achievements || profile.achievements;
  
  // Update userimage if provided
  if (userimage) {
    await User.findByIdAndUpdate(req.user.id, { userimage });
  }
  

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