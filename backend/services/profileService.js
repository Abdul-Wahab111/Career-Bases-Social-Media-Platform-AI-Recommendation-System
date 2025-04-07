// profileService.js

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
 * Enhanced text matching between profile and job
 * @param {Object} profile - Current profile object
 * @param {Object} job - Job to match against
 * @param {Array} csvJobs - Jobs loaded from CSV for context
 * @returns {boolean} - Whether there's a match
 */
const getTextBasedMatchScore = (profile, job, csvJobs = []) => {
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
    
    console.log(`📊 Match score for job ${job._id}: ${score}`);
    return score >= 5; // Threshold for matching
  } catch (error) {
    console.error(`❌ Error in text matching:`, error);
    return false;
  }
};

/**
 * Updates a profile with matching jobs
 * Uses enhanced text matching with RAG when possible, falls back to text matching on rate limiting
 * @param {string} profileId - The ID of the profile
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - Results of the update operation
 */
const updateProfileWithMatchingJobs = async (profileId, isUpdate = false) => {
  try {
    console.log(`📊 Finding job matches for profile: ${profileId} (${isUpdate ? 'Update' : 'New'})`);
    
    // Initialize Google Gemini AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    
    // Get the profile details
    const profile = await Profile.findById(profileId);
    if (!profile) {
      console.log("❌ Profile not found");
      return { success: false, error: "Profile not found" };
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
    
    // Get all jobs from the database
    const jobs = await Job.find({});
    console.log(`🔍 Checking ${jobs.length} jobs for potential matches...`);
    
    const addedJobs = [];
    const removedJobs = [];
    
    // Tracking for rate limiting
    let useGemini = true;
    let rateLimitHits = 0;
    const MAX_RATE_LIMIT_HITS = 2; // Switch to fallback after this many rate limit errors
    
    // Process each job
    for (const job of jobs) {
      try {
        const hasJob = profile.job.some(id => id.toString() === job._id.toString());
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
            console.log(`🤖 Gemini response for job ${job._id}: ${result}`);
            
            isMatch = result.includes("YES");
            
            // Add significant delay to avoid rate limiting
            await delay(2000); // 2 second delay between API calls
            
          } catch (geminiError) {
            // Check if it's a rate limit error
            if (geminiError.message && geminiError.message.includes("429")) {
              rateLimitHits++;
              console.log(`⚠️ Rate limit hit (${rateLimitHits}/${MAX_RATE_LIMIT_HITS}). Adding longer delay...`);
              
              if (rateLimitHits >= MAX_RATE_LIMIT_HITS) {
                console.log(`🔄 Switching to text-based matching for remaining jobs due to rate limits`);
                useGemini = false;
              }
              
              // Fall back to text matching for this job
              isMatch = getTextBasedMatchScore(profile, job, csvJobs);
              
              // Add extra delay after rate limit error
              await delay(5000);
            } else {
              console.error(`❌ Error with Gemini for job ${job._id}:`, geminiError);
              // Fall back to text matching
              isMatch = getTextBasedMatchScore(profile, job, csvJobs);
            }
          }
        } else {
          // Use text-based matching if we've disabled Gemini
          isMatch = getTextBasedMatchScore(profile, job, csvJobs);
        }
        
        // Process based on match result
        if (isMatch) {
          // Add job if it's not already there
          if (!hasJob) {
            profile.job.push(job._id);
            addedJobs.push({
              jobId: job._id,
              title: job.title,
              action: "added"
            });
            console.log(`✅ Added job ${job._id} to profile`);
          } else {
            console.log(`✓ Job ${job._id} already in profile and still matches`);
          }
        } else {
          // Remove job if it's there but no longer matches
          if (hasJob) {
            profile.job = profile.job.filter(id => id.toString() !== job._id.toString());
            removedJobs.push({
              jobId: job._id,
              title: job.title,
              action: "removed"
            });
            console.log(`🗑️ Removed job ${job._id} from profile as it no longer matches`);
          } else {
            console.log(`⏭️ No match for job ${job._id}`);
          }
        }
        
      } catch (jobError) {
        console.error(`❌ Error processing job ${job._id}:`, jobError);
        // Continue with other jobs even if one fails
      }
    }
    
    // Save the profile once after all changes
    await profile.save();
    
    console.log(`🎉 Matching complete. Added ${addedJobs.length} jobs, removed ${removedJobs.length} jobs.`);
    
    return {
      success: true,
      profileId,
      userId: profile.user,
      addedJobs,
      removedJobs,
      totalProcessed: jobs.length
    };
    
  } catch (error) {
    console.error(`❌ Error in updateProfileWithMatchingJobs:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// For backward compatibility
const updateProfileForNewProfile = (profileId) => updateProfileWithMatchingJobs(profileId, false);

// Method specifically for profile updates
const updateProfileForProfileUpdate = (profileId) => updateProfileWithMatchingJobs(profileId, true);

module.exports = {
  updateProfileWithMatchingJobs,
  updateProfileForNewProfile,
  updateProfileForProfileUpdate,
  // ... other service methods
};