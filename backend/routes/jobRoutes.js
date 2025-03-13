const express = require("express");
const { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  applyForJob,
  checkApplicationStatus,
  getJobApplicants,
  updateApplicantStatus,
  getJobSuggestionsForProfile,
  updateProfileJobs,
  updateAllProfilesWithJobs,
  getJobsByUser,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Basic job routes
router.post("/", protect, createJob); // Create a job (only for logged-in users)
router.get("/", getJobs); // Get all jobs
router.get("/:id", getJobById); // Get job by ID
router.put("/:id", protect, updateJob); // Update job (only for logged-in users)
router.delete("/:id", protect, deleteJob); // Delete job (only for logged-in users)
router.get("/user/:userId", protect, getJobsByUser); // Get jobs posted by a specific user

// Job application routes
router.post("/:id/apply", protect, applyForJob); // Apply for a job
router.get("/:id/application-status", protect, checkApplicationStatus); // Check if user has applied to a job
router.get("/:id/applicants", protect, getJobApplicants); // Get job applicants
router.patch("/:id/applicants/:applicantId", protect, updateApplicantStatus); // Update applicant status

// Job matching routes
router.get("/suggestions/:profileId", protect, getJobSuggestionsForProfile); // Get job suggestions for a profile
router.put("/match/:profileId", protect, updateProfileJobs); // Update profile with matching jobs
router.put("/match-all", protect, updateAllProfilesWithJobs); // Update all profiles with matching jobs (admin only)

module.exports = router;