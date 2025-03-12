const mongoose = require("mongoose");

const jobSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: Number },
    skillsRequired: [{ type: String, required: true }],
    educationRequired: [
      {
        degree: { type: String, required: true },
        field: { type: String, required: true },
      },
    ],
    coursesPreferred: [
      {
        courseName: { type: String, required: true },
        provider: { type: String },
      },
    ],
    interests: [{ type: String }],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        resume: { type: String }, // URL to resume
        coverLetter: { type: String }, // New field for cover letter
        status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
