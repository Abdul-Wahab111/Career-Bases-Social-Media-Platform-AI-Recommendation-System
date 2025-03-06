const mongoose = require("mongoose");

const profileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bio: {
      type: String,
      // required: true,
    },
    skills: {
      type: [String], // Array of skills
      // required: true,
    },
    education: {
      type: String,
      // required: true,
    },
    courses: {
      type: [String], // Array of courses
      // required: false,
    },
    interests: {
      type: [String], // Array of interests
      // required: false,
    },
    job: {
      type: String, // Job title or position
      // required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
