// jobService.js

const Profile = require("../models/profileModel");
const Job = require("../models/jobModel");
const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
require("dotenv").config();

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Loads and parses the job.csv file
 * @returns {Promise<Array>} Array of job objects from CSV
 */
const loadJobsFromCSV = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(process.cwd(), 'job.csv'))
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`📊 Loaded ${results.length} jobs from CSV`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV file:', error);
        reject(error);
      });
  });
};

/**
 * Enhanced text matching between job and profile
 * @param {Object} job - Current job object
 * @param {Object} profile - User profile to match
 * @param {Array} csvJobs - Jobs loaded from CSV for context
 * @returns {boolean} - Whether there's a match
 */
const getTextBasedMatchScore = (job, profile, csvJobs = []) => {
  try {
    // Function to check if any items in array A match any items in array B
    const hasOverlap = (arrayA = [], arrayB = []) => {
      if (!arrayA || !arrayB) return false;
      if (!Array.isArray(arrayA)) arrayA = arrayA.split(',').map(item => item.trim());
      if (!Array.isArray(arrayB)) arrayB = arrayB.split(',').map(item => item.trim());
      
      return arrayA.some(itemA => 
        arrayB.some(itemB => 
          itemA.toLowerCase().includes(itemB.toLowerCase()) || 
          itemB.toLowerCase().includes(itemA.toLowerCase())
        )
      );
    };
    
    // Convert any string fields to arrays
    const jobSkills = Array.isArray(job.skillsRequired) ? job.skillsRequired : 
                      (job.skillsRequired ? job.skillsRequired.split(',').map(s => s.trim()) : []);
    const jobCourses = Array.isArray(job.coursesPreferred) ? job.coursesPreferred : 
                      (job.coursesPreferred ? job.coursesPreferred.split(',').map(c => c.trim()) : []);
    const jobInterests = Array.isArray(job.interests) ? job.interests : 
                        (job.interests ? job.interests.split(',').map(i => i.trim()) : []);
    
    const profileSkills = Array.isArray(profile.skills) ? profile.skills : 
                         (profile.skills ? profile.skills.split(',').map(s => s.trim()) : []);
    const profileCourses = Array.isArray(profile.courses) ? profile.courses : 
                          (profile.courses ? profile.courses.split(',').map(c => c.trim()) : []);
    const profileInterests = Array.isArray(profile.interests) ? profile.interests : 
                            (profile.interests ? profile.interests.split(',').map(i => i.trim()) : []);
    
    // Check overlaps
    const skillsMatch = hasOverlap(jobSkills, profileSkills);
    const coursesMatch = hasOverlap(jobCourses, profileCourses);
    const interestsMatch = hasOverlap(jobInterests, profileInterests);
    const educationMatch = profile.education && job.educationRequired && 
                          profile.education.toLowerCase().includes(job.educationRequired.toLowerCase());
    
    // Education keywords check
    const educationKeywords = ['degree', 'bachelor', 'master', 'phd', 'diploma', 'certificate'];
    const educationKeywordMatch = educationKeywords.some(keyword => {
      return (profile.education && profile.education.toLowerCase().includes(keyword)) && 
             (job.educationRequired && job.educationRequired.toLowerCase().includes(keyword));
    });
    
    // Scoring
    let score = 0;
    if (skillsMatch) score += 5;
    if (coursesMatch) score += 3;
    if (interestsMatch) score += 2;
    if (educationMatch || educationKeywordMatch) score += 4;
    
    // Enhance with CSV jobs context
    if (csvJobs && csvJobs.length > 0) {
      // Find similar job titles
      const jobTitleWords = job.title.toLowerCase().split(' ');
      const titleMatchesInCSV = csvJobs.filter(csvJob => {
        if (!csvJob.title) return false;
        const csvJobTitle = csvJob.title.toLowerCase();
        return jobTitleWords.some(word => word.length > 3 && csvJobTitle.includes(word));
      });
      
      if (titleMatchesInCSV.length > 0) {
        // Check if profile matches any of the similar jobs from CSV
        titleMatchesInCSV.forEach(csvJob => {
          const csvJobSkills = csvJob.skillsRequired ? csvJob.skillsRequired.split(',').map(s => s.trim()) : [];
          if (hasOverlap(csvJobSkills, profileSkills)) score += 2;
          
          const csvJobCourses = csvJob.coursesPreferred ? csvJob.coursesPreferred.split(',').map(c => c.trim()) : [];
          if (hasOverlap(csvJobCourses, profileCourses)) score += 1;
        });
      }
    }
    
    console.log(`📊 Match score for profile ${profile._id}: ${score}`);
    return score >= 5; // Threshold for matching
  } catch (error) {
    console.error(`❌ Error in text matching:`, error);
    return false;
  }
};

/**
 * Updates user profiles for a job (new or updated)
 * Uses enhanced text matching with RAG when possible, falls back to text matching on rate limiting
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
    
    // Load jobs from CSV for context
    let csvJobs = [];
    try {
      csvJobs = await loadJobsFromCSV();
      console.log(`📚 Loaded ${csvJobs.length} jobs from CSV for context`);
    } catch (csvError) {
      console.error(`❌ Error loading CSV:`, csvError);
      // Continue with empty context
    }
    
    // Get all profiles
    const profiles = await Profile.find({});
    console.log(`🔍 Checking ${profiles.length} profiles for potential matches...`);
    
    const updatedProfiles = [];
    const removedProfiles = [];
    
    // Tracking for rate limiting
    let useGemini = true;
    let rateLimitHits = 0;
    const MAX_RATE_LIMIT_HITS = 2; // Switch to fallback after this many rate limit errors
    
    // Process each profile
    for (const profile of profiles) {
      try {
        const hasJob = profile.job.includes(jobId);
        let isMatch = false;
        
        // Try using Gemini if we haven't hit too many rate limits
        if (useGemini && rateLimitHits < MAX_RATE_LIMIT_HITS) {
          try {
            // Extract relevant jobs from CSV for context (simple keyword matching)
            const relevantJobs = csvJobs.filter(csvJob => {
              if (!csvJob.title || !job.title) return false;
              return csvJob.title.toLowerCase().includes(job.title.toLowerCase()) || 
                     job.title.toLowerCase().includes(csvJob.title.toLowerCase());
            }).slice(0, 3); // Take up to 3 relevant jobs
            
            // Create enhanced context
            const enhancedContext = relevantJobs.map((relJob, index) => `
              Similar Job ${index + 1}:
              - Title: ${relJob.title || ''}
              - Skills Required: ${relJob.skillsRequired || ''}
              - Education Required: ${relJob.educationRequired || ''}
              - Courses Preferred: ${relJob.coursesPreferred || ''}
              - Interests: ${relJob.interests || ''}
            `).join('\n');
            
            // Create prompt for Gemini with enhanced context
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
            
            ${enhancedContext ? `ENHANCED CONTEXT (Similar jobs from our database):\n${enhancedContext}` : ''}
            
            Analyze if there is a good match based on overlapping skills, relevant education, courses, and interests.
            Return only "YES" if there's a good match or "NO" if there isn't.
            `;
            
            // Call Gemini API with longer timeout and retry
            const response = await ai.models.generateContent({
              model: "gemini-2.0-flash",
              contents: promptContent,
            });
            
            const result = response.text.trim().toUpperCase();
            console.log(`🤖 Gemini response for profile ${profile._id}: ${result}`);
            
            isMatch = result.includes("YES");
            
            // Add significant delay to avoid rate limiting
            await delay(2000); // 2 second delay between API calls
            
          } catch (geminiError) {
            // Check if it's a rate limit error
            if (geminiError.message && geminiError.message.includes("429")) {
              rateLimitHits++;
              console.log(`⚠️ Rate limit hit (${rateLimitHits}/${MAX_RATE_LIMIT_HITS}). Adding longer delay...`);
              
              if (rateLimitHits >= MAX_RATE_LIMIT_HITS) {
                console.log(`🔄 Switching to text-based matching for remaining profiles due to rate limits`);
                useGemini = false;
              }
              
              // Fall back to text matching for this profile
              isMatch = getTextBasedMatchScore(job, profile, csvJobs);
              
              // Add extra delay after rate limit error
              await delay(5000);
            } else {
              console.error(`❌ Error with Gemini for profile ${profile._id}:`, geminiError);
              // Fall back to text matching
              isMatch = getTextBasedMatchScore(job, profile, csvJobs);
            }
          }
        } else {
          // Use text-based matching if we've disabled Gemini
          isMatch = getTextBasedMatchScore(job, profile, csvJobs);
        }
        
        // Process based on match result
        if (isMatch) {
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