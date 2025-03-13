const Job = require("../models/jobModel");
const jobService = require("../services/jobService");
const Profile = require("../models/profileModel");

// ✅ Create a Job
const createJob = async (req, res) => {
  try {
    console.log("📌 Creating a new job...");
    const { title, description, company, location, salary, skillsRequired, educationRequired, coursesPreferred, interests } = req.body;

    if (!title || !description || !company || !location) {
      console.log("❌ Missing required fields.");
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      skillsRequired,
      educationRequired,
      coursesPreferred,
      interests,
      postedBy: req.user._id, // Authenticated user
    });

    console.log("✅ Job created successfully:", job);
    
    // Add job to embedding database
    await jobService.addJobToEmbeddingDatabase(job);
    
    // Update matching profiles with this new job
    const updateResult = await jobService.updateProfilesForNewJob(job._id);
    
    res.status(201).json({
      job,
      profilesUpdated: updateResult.updatedProfiles.length
    });
  } catch (error) {
    console.error("❌ Error creating job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Jobs (Populating postedBy and applicants)
const getJobs = async (req, res) => {
  try {
    console.log("📌 Fetching all jobs...");
    const jobs = await Job.find()
      .populate("postedBy" ,"name email")
      .populate("applicants.user", "name userimage email");

    console.log(`✅ Found ${jobs.length} jobs`);
    res.status(200).json(jobs);
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Job by ID (Populating postedBy and applicants)
const getJobById = async (req, res) => {
  try {
    console.log(`📌 Fetching job with ID: ${req.params.id}`);
    const job = await Job.findById(req.params.id)
      .populate("postedBy", "name email")
      .populate("applicants.user", "name userimage email");

    if (!job) {
      console.log("❌ Job not found.");
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("✅ Job found:", job);
    res.status(200).json(job);
  } catch (error) {
    console.error("❌ Error fetching job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Job
const updateJob = async (req, res) => {
  try {
    console.log(`📌 Updating job with ID: ${req.params.id}`);
    let job = await Job.findById(req.params.id);

    if (!job) {
      console.log("❌ Job not found.");
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      console.log("❌ Unauthorized to update this job.");
      return res.status(403).json({ message: "Unauthorized" });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log("✅ Job updated:", job);
    
    // Update job in embedding database
    await jobService.addJobToEmbeddingDatabase(job);
    
    // Re-evaluate profiles to see if matching changed
    await jobService.updateProfilesForNewJob(job._id);
    
    res.status(200).json(job);
  } catch (error) {
    console.error("❌ Error updating job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Job
const deleteJob = async (req, res) => {
  try {
    console.log(`📌 Deleting job with ID: ${req.params.id}`);
    const job = await Job.findById(req.params.id);

    if (!job) {
      console.log("❌ Job not found.");
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      console.log("❌ Unauthorized to delete this job.");
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove job from profiles
    await Profile.updateMany(
      { job: job._id },
      { $pull: { job: job._id } }
    );

    await job.deleteOne();
    console.log("✅ Job deleted successfully.");
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Apply for a Job (Now includes Cover Letter)
const applyForJob = async (req, res) => {
  try {
    console.log(`📌 Applying for job ID: ${req.params.id}`);
    const { resume, coverLetter } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      console.log("❌ Job not found.");
      return res.status(404).json({ message: "Job not found" });
    }

    const alreadyApplied = job.applicants.find(applicant => applicant.user.toString() === req.user._id.toString());

    if (alreadyApplied) {
      console.log("❌ User has already applied.");
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    job.applicants.push({
      user: req.user._id,
      resume,
      coverLetter,
      status: "Pending",
      appliedAt: new Date(),
    });

    await job.save();
    console.log("✅ Application submitted successfully.");
    res.status(200).json({ message: "Application submitted successfully." });
  } catch (error) {
    console.error("❌ Error applying for job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check application status
const checkApplicationStatus = async (req, res) => {
  try {
    console.log(`📌 Checking application status for job ID: ${req.params.id} and user ID: ${req.user._id}`);
    const job = await Job.findById(req.params.id);

    if (!job) {
      console.log("❌ Job not found.");
      return res.status(404).json({ message: "Job not found" });
    }

    const hasApplied = job.applicants.some(
      applicant => applicant.user.toString() === req.user._id.toString()
    );

    console.log(`✅ Application status checked: ${hasApplied ? "Applied" : "Not applied"}`);
    res.status(200).json({ hasApplied });
  } catch (error) {
    console.error("❌ Error checking application status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get job applicants
const getJobApplicants = async (req, res) => {
  try {
    console.log(`📌 Fetching applicants for job ID: ${req.params.id}`);
    const job = await Job.findById(req.params.id)
      .populate("applicants.user", "name email userimage")
      .select("title applicants");

    if (!job) {
      console.log("❌ Job not found.");
      return res.status(404).json({ message: "Job not found" });
    }

    // Optional: Check if the requester is the job poster
    if (job.postedBy.toString() !== req.user._id.toString()) {
      console.log("❌ Unauthorized to view applicants.");
      return res.status(403).json({ message: "Unauthorized" });
    }

    console.log(`✅ Found ${job.applicants.length} applicants`);
    res.status(200).json(job);
  } catch (error) {
    console.error("❌ Error fetching applicants:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update applicant status
const updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const applicant = job.applicants.id(req.params.applicantId);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    applicant.status = status;
    await job.save();

    res.status(200).json({ message: "Applicant status updated" });
  } catch (error) {
    console.error("Error updating applicant status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get job suggestions for a user profile
const getJobSuggestionsForProfile = async (req, res) => {
  try {
    console.log(`📌 Getting job suggestions for profile ID: ${req.params.profileId}`);
    const profileId = req.params.profileId;
    
    // Get user profile
    const profile = await Profile.findById(profileId);
    if (!profile) {
      console.log("❌ Profile not found.");
      return res.status(404).json({ message: "Profile not found" });
    }
    
    // Format user data
    const userData = {
      Skills: profile.skills.join(", "),
      Education: profile.education,
      Courses: profile.courses.join(", "),
      Interests: profile.interests.join(", ")
    };
    
    // Get job suggestion
    const suggestion = await jobService.getJobSuggestion(userData);
    
    console.log("✅ Job suggestions generated successfully");
    res.status(200).json({
      success: true,
      suggestion
    });
  } catch (error) {
    console.error("❌ Error getting job suggestions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile with matching jobs
const updateProfileJobs = async (req, res) => {
  try {
    console.log(`📌 Updating profile ID: ${req.params.profileId} with matching jobs`);
    const profileId = req.params.profileId;
    
    const result = await jobService.updateProfileWithMatchingJobs(profileId);
    
    console.log(`✅ Profile updated with ${result.matchCount} matching jobs`);
    res.status(200).json({
      success: true,
      matchCount: result.matchCount,
      message: `Updated profile with ${result.matchCount} matching jobs`
    });
  } catch (error) {
    console.error("❌ Error updating profile with matching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update all profiles with matching jobs (admin function)
const updateAllProfilesWithJobs = async (req, res) => {
  try {
    console.log("📌 Updating all profiles with matching jobs");
    const profiles = await Profile.find();
    
    const results = [];
    for (const profile of profiles) {
      const result = await jobService.updateProfileWithMatchingJobs(profile._id);
      results.push({
        profileId: profile._id,
        matchCount: result.matchCount
      });
    }
    
    console.log(`✅ Updated ${profiles.length} profiles with matching jobs`);
    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error("❌ Error updating all profiles with matching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getJobsByUser = async (req, res) => {
  try {
    console.log(`📌 Fetching jobs posted by user ID: ${req.params.userId}`);
    const { userId } = req.params;
    const jobs = await Job.find({ postedBy: userId });

    if (!jobs.length) {
      console.log("❌ No jobs found for this user.");
      // Return an empty array with 200 status instead of 404
      return res.status(200).json([]);
    }

    console.log(`✅ Found ${jobs.length} jobs for user ID: ${userId}`);
    res.status(200).json(jobs);
  } catch (error) {
    console.error("❌ Error fetching jobs by user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
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
  getJobsByUser
};