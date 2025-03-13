const asyncHandler = require("express-async-handler");
const Profile = require("../models/profileModel");
const User = require("../models/userModel");
const jobService = require("../services/jobService");

// @desc    Create user profile
// @route   POST /api/profiles
// @access  Private
const createOrUpdateProfile = async (req, res) => {
  try {
    console.log(`📌 Creating/updating profile for user: ${req.user._id}`);
    const { bio, skills, education, courses, interests, achievements, userimage } = req.body;

    // Find existing profile
    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      profile.bio = bio || profile.bio;
      profile.skills = skills || profile.skills;
      profile.education = education || profile.education;
      profile.courses = courses || profile.courses;
      profile.interests = interests || profile.interests;
      profile.achievements = achievements || profile.achievements;
      profile.userimage = userimage || profile.userimage;
      
      await profile.save();
      console.log(`✅ Profile updated for user: ${req.user._id}`);
    } else {
      // Create new profile
      profile = await Profile.create({
        user: req.user._id,
        bio,
        skills,
        education,
        courses,
        interests,
        achievements,
        userimage
      });
      console.log(`✅ Profile created for user: ${req.user._id}`);
    }

    // Update profile with matching jobs
    await jobService.updateProfileWithMatchingJobs(profile._id);

    res.status(200).json(profile);
  } catch (error) {
    console.error("❌ Error creating/updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


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
const viewAllProfiles = asyncHandler(async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", "name email userimage followers following");

    if (!profiles || profiles.length === 0) {
      res.status(404);
      throw new Error("No profiles found");
    }

    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ message: error.message });
  }
});
module.exports = {
  createOrUpdateProfile,
  viewOwnProfile,
  updateOwnProfile,
  deleteOwnProfile,
  viewAllProfiles,
};