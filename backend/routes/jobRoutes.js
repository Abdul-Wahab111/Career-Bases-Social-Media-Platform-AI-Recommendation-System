const express = require("express");
const { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  applyForJob 
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Job routes
router.post("/", protect, createJob); // Create a job (only for logged-in users)
router.get("/", getJobs); // Get all jobs
router.get("/:id", getJobById); // Get job by ID
router.put("/:id", protect, updateJob); // Update job (only for logged-in users)
router.delete("/:id", protect, deleteJob); // Delete job (only for logged-in users)
router.post("/:id/apply", protect, applyForJob); // Apply for a job

module.exports = router;
