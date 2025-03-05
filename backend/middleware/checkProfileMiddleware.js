const asyncHandler = require("express-async-handler");
const Profile = require("../models/profileModel");

const checkProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    res.status(400);
    throw new Error("Please create a profile first.");
  }
  next(); // Continue to the next middleware or controller
});

module.exports = { checkProfile };
