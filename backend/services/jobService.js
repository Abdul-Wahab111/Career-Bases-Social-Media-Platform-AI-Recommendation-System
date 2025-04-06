// jobService.js

const Profile = require("../models/profileModel");
const Job = require("../models/jobModel");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Updates user profiles for a job (new or updated)
 * Uses Gemini AI to determine matches, adds the job to matching profiles
 * and removes it from non-matching profiles (for updates)
 * @param {string} jobId - The ID of the job
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - Results of the update operation
 */
const updateProfilesForJob = async (jobId, isUpdate = false) => {
  try {
    console.log(`📊 Finding profile matches for job: ${jobId} (${isUpdate ? 'Update' : 'New'})`);
    
    // Initialize Google Gemini AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    
    // Get the job details
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("❌ Job not found");
      return { success: false, error: "Job not found" };
    }
    
    // Get all profiles
    const profiles = await Profile.find({});
    console.log(`🔍 Checking ${profiles.length} profiles for potential matches...`);
    
    const updatedProfiles = [];
    const removedProfiles = [];
    
    // Process each profile with a delay between API calls
    for (const profile of profiles) {
      try {
        const hasJob = profile.job.includes(jobId);
        
        // Create prompt for Gemini
        const promptContent = `
        I need to determine if a job matches a user's profile based on skills, education, courses, and interests.
        
        JOB:
        - Title: ${job.title}
        - Skills Required: ${job.skillsRequired ? job.skillsRequired.join(', ') : 'None specified'}
        - Education Required: ${job.educationRequired || 'None specified'}
        - Courses Preferred: ${job.coursesPreferred ? job.coursesPreferred.join(', ') : 'None specified'}
        - Interests: ${job.interests ? job.interests.join(', ') : 'None specified'}
        
        USER PROFILE:
        - Skills: ${profile.skills ? profile.skills.join(', ') : 'None specified'}
        - Education: ${profile.education || 'None specified'}
        - Courses: ${profile.courses ? profile.courses.join(', ') : 'None specified'}
        - Interests: ${profile.interests ? profile.interests.join(', ') : 'None specified'}
        
        Analyze if there is a good match based on overlapping skills, relevant education, courses, and interests.
        Return only "YES" if there's a good match or "NO" if there isn't.
        `;
        
        // Call Gemini API
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: promptContent,
        });
        
        const result = response.text.trim().toUpperCase();
        console.log(`🤖 RAG response for profile ${profile._id}: ${result}`);
        
        // Process based on match result
        if (result.includes("YES")) {
          // Add job if it's not already there
          if (!hasJob) {
            profile.job.push(jobId);
            await profile.save();
            updatedProfiles.push({
              profileId: profile._id,
              userId: profile.user,
              action: "added"
            });
            console.log(`✅ Added job to profile ${profile._id}`);
          } else {
            console.log(`✓ Job already in profile ${profile._id} and still matches`);
          }
        } else {
          // Remove job if it's there but no longer matches
          if (hasJob) {
            profile.job = profile.job.filter(job => job.toString() !== jobId.toString());
            await profile.save();
            removedProfiles.push({
              profileId: profile._id,
              userId: profile.user,
              action: "removed"
            });
            console.log(`🗑️ Removed job from profile ${profile._id} as it no longer matches`);
          } else {
            console.log(`⏭️ No match for profile ${profile._id}`);
          }
        }
        
        // Add delay to avoid rate limiting
        await delay(1000); // 1 second delay between API calls
        
      } catch (profileError) {
        console.error(`❌ Error processing profile ${profile._id}:`, profileError);
        // Continue with other profiles even if one fails
      }
    }
    
    console.log(`🎉 Matching complete. Added to ${updatedProfiles.length} profiles, removed from ${removedProfiles.length} profiles.`);
    
    return {
      success: true,
      updatedProfiles,
      removedProfiles,
      totalProcessed: profiles.length
    };
    
  } catch (error) {
    console.error(`❌ Error in updateProfilesForJob:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// For backward compatibility
const updateProfilesForNewJob = (jobId) => updateProfilesForJob(jobId, false);

// Method specifically for job updates
const updateProfilesForJobUpdate = (jobId) => updateProfilesForJob(jobId, true);

module.exports = {
  updateProfilesForNewJob,
  updateProfilesForJobUpdate,
  updateProfilesForJob,
  // ... other service methods
};