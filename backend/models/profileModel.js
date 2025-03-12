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
    },
    skills: {
      type: [String], // Array of skills
    },
    education: {
      type: String,
    },
    courses: {
      type: [String], // Array of courses
    },
    interests: {
      type: [String], // Array of interests
    },
    job: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", // Reference to Job model
      },
    ],
    userimage: {
      type: String, // URL of the profile image
    },
    achievements: {
      type: [String], // Array of personal achievements
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
