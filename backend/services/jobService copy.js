const Job = require('../models/jobModel');
const Profile = require('../models/profileModel');
const embedService = require('./jobEmbeddingService');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Added the missing import
const dotenv = require('dotenv');
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

// Add job to embedding database
const addJobToEmbeddingDatabase = async (job) => {
  try {
    console.log("📤 Adding job to embedding database:", job._id);
    const embedding = await embedService.generateEmbedding(job);
    await embedService.addEmbeddingToPinecone(job._id, embedding, {
      id: job._id.toString(),
      title: job.title,
      company: job.company,
      skillsRequired: job.skillsRequired,
      educationRequired: job.educationRequired,
      coursesPreferred: job.coursesPreferred,
      interests: job.interests
    });
    console.log("✅ Job added to embedding database successfully");
    return true;
  } catch (error) {
    console.error("❌ Error adding job to embedding database:", error.message);
    return false;
  }
};

// Find matching profiles for a new job
const updateProfilesForNewJob = async (jobId) => {
  try {
    console.log("🔍 Finding matching profiles for job:", jobId);
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    
    // Using batching to avoid too many API requests
    const BATCH_SIZE = 5; // Reduced batch size
    const profiles = await Profile.find({}).select('_id skills education courses interests');
    const totalProfiles = profiles.length;
    const totalBatches = Math.ceil(totalProfiles / BATCH_SIZE);
    
    console.log(`📊 Processing ${totalProfiles} profiles in ${totalBatches} batches`);
    
    const updatedProfiles = [];
    
    for (let i = 0; i < totalBatches; i++) {
      const batchProfiles = profiles.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      
      // Process batch sequentially to better control API usage
      for (const profile of batchProfiles) {
        try {
          const isMatch = await matchProfileWithJob(profile, job);
          if (isMatch) {
            // Update profile with new job
            await Profile.findByIdAndUpdate(
              profile._id,
              { $addToSet: { job: jobId } }
            );
            updatedProfiles.push(profile._id);
          }
        } catch (error) {
          console.error(`Error matching profile ${profile._id}:`, error.message);
          // Continue with other profiles
          continue;
        }
      }
      
      // Add a larger delay between batches to avoid rate limiting
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`✅ Updated ${updatedProfiles.length} profiles with job: ${jobId}`);
    return { success: true, updatedProfiles };
  } catch (error) {
    console.error("❌ Error updating profiles for new job:", error.message);
    return { success: false, error: error.message };
  }
};

// Match profile with job using basic filtering first
const matchProfileWithJob = async (profile, job) => {
  try {
    // First, perform basic filtering to reduce API calls
    const hasCommonSkills = job.skillsRequired?.some(skill => 
      profile.skills?.includes(skill)
    );
    
    const sameEducation = job.educationRequired === profile.education;
    
    const hasCommonCourses = job.coursesPreferred?.some(course => 
      profile.courses?.includes(course)
    );
    
    const hasCommonInterests = job.interests?.some(interest => 
      profile.interests?.includes(interest)
    );
    
    // If there's no overlap at all, no need to call the API
    if (!hasCommonSkills && !sameEducation && !hasCommonCourses && !hasCommonInterests) {
      return false;
    }
    
    // Use semantic matching via Gemini for more nuanced comparisons
    return await semanticMatchProfileWithJob(profile, job);
  } catch (error) {
    console.error("Error in profile-job matching:", error.message);
    // On error, fall back to basic matching
    return basicMatchProfileWithJob(profile, job);
  }
};

// Use Gemini for semantic matching
// Use the correct import and initialization method
const semanticMatchProfileWithJob = async (profile, job) => {
  try {
    // Create the client with proper initialization
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
    
    const prompt = `
    You are a job matching algorithm. Analyze the job requirements and candidate profile to determine if there's a good match. Return only "YES" if there's a match or "NO" if there's not a match.

    Job Requirements:
    - Skills Required: ${job.skillsRequired?.join(', ') || 'None specified'}
    - Education Required: ${job.educationRequired || 'None specified'}
    - Courses Preferred: ${job.coursesPreferred?.join(', ') || 'None specified'}
    - Interests: ${job.interests?.join(', ') || 'None specified'}

    Candidate Profile:
    - Skills: ${profile.skills?.join(', ') || 'None specified'}
    - Education: ${profile.education || 'None specified'}
    - Courses: ${profile.courses?.join(', ') || 'None specified'}
    - Interests: ${profile.interests?.join(', ') || 'None specified'}

    Important: Respond with only "YES" or "NO".
    `;
    
    // Generate content using the correct method structure
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });
    
    // Access the response text properly
    const response = result.text().trim().toUpperCase();
    return response === "YES";
  } catch (error) {
    console.error("Error in semantic matching:", error.message);
    // Fallback to basic matching if API fails
    return basicMatchProfileWithJob(profile, job);
  }
};
// Fallback basic matching algorithm without using API
const basicMatchProfileWithJob = (profile, job) => {
  // Calculate match score based on overlap
  let score = 0;
  let totalCriteria = 0;
  
  // Check skills (weighted higher)
  if (job.skillsRequired?.length && profile.skills?.length) {
    totalCriteria += 2;
    const matchingSkills = job.skillsRequired.filter(skill => 
      profile.skills.includes(skill)
    );
    score += (matchingSkills.length / job.skillsRequired.length) * 2;
  }
  
  // Check education
  if (job.educationRequired && profile.education) {
    totalCriteria += 1;
    if (job.educationRequired === profile.education) {
      score += 1;
    }
  }
  
  // Check courses
  if (job.coursesPreferred?.length && profile.courses?.length) {
    totalCriteria += 1;
    const matchingCourses = job.coursesPreferred.filter(course => 
      profile.courses.includes(course)
    );
    score += (matchingCourses.length / job.coursesPreferred.length);
  }
  
  // Check interests
  if (job.interests?.length && profile.interests?.length) {
    totalCriteria += 0.5; // Lower weight for interests
    const matchingInterests = job.interests.filter(interest => 
      profile.interests.includes(interest)
    );
    score += (matchingInterests.length / job.interests.length) * 0.5;
  }
  
  // Calculate match percentage
  const matchPercentage = totalCriteria > 0 ? (score / totalCriteria) * 100 : 0;
  
  // Consider it a match if score is at least 60%
  return matchPercentage >= 60;
};

module.exports = {
  addJobToEmbeddingDatabase,
  updateProfilesForNewJob
};