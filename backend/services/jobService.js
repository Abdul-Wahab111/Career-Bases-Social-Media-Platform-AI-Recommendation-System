const { GoogleGenerativeAI } = require("@google/generative-ai");
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Job = require("../models/jobModel");
const Profile = require("../models/profileModel");

class JobService {
  constructor() {
    // Initialize core service properties
    this.jobs = [];
    this.isDataLoaded = false;
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Tracking properties for initialization
    this.totalJobs = 0;
    this.processedJobs = 0;

    // Promise to track initialization
    this.initializationPromise = null;
  }

  // Clean and validate job data
  static cleanJobData(row) {
    return {
      Skills: row.Skills || '',
      Education: row.Education || '',
      Courses: row.Courses || '',
      Interests: row.Interests || '',
      Job: row.Job || ''
    };
  }

  // Initialize job data from CSV
  async initializeJobData() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise((resolve, reject) => {
      const csvPath = path.join(__dirname, '..', 'job.csv');
      console.log('Initializing job data from:', csvPath);

      const jobs = [];
      
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          const cleanedRow = JobService.cleanJobData(row);
          jobs.push(cleanedRow);
        })
        .on('end', async () => {
          this.totalJobs = jobs.length;
          console.log(`Total jobs to process: ${this.totalJobs}`);

          try {
            // Process embeddings in batches
            const batchSize = 10;
            for (let i = 0; i < jobs.length; i += batchSize) {
              const batch = jobs.slice(i, i + batchSize);
              await this.processBatch(batch);
              
              // Update and log progress
              this.processedJobs += batch.length;
              const progress = Math.round((this.processedJobs / this.totalJobs) * 100);
              console.log(`Progress: ${progress}% (${this.processedJobs}/${this.totalJobs})`);
            }

            // Finalize job loading
            this.jobs = jobs;
            this.isDataLoaded = true;
            console.log(`Loaded and processed ${this.jobs.length} jobs`);
            resolve(this.jobs);
          } catch (error) {
            console.error('Error initializing job data:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('CSV read error:', error);
          reject(error);
        });
    });

    return this.initializationPromise;
  }

  // Process batch of jobs for embedding generation
  async processBatch(batch) {
    const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
    
    const embeddingPromises = batch.map(async (job) => {
      try {
        const jobText = this.formatJobText(job);
        const { embedding } = await model.embedContent(jobText);
        job.embedding = embedding.values;
      } catch (error) {
        console.error('Error generating embedding for job:', job, error);
        job.embedding = null;
      }
      return job;
    });

    return Promise.all(embeddingPromises);
  }

  // Format job data for embedding
  formatJobText(job) {
    return `
      Job: ${job.Job}
      Skills: ${job.Skills}
      Education: ${job.Education}
      Courses: ${job.Courses}
      Interests: ${job.Interests}
    `;
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }
    
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    return dotProduct / (normA * normB);
  }

  // Get job suggestions based on user data
  async getJobSuggestion(userData) {
    // Ensure data is loaded
    if (!this.isDataLoaded) {
      await this.initializeJobData();
    }

    // Generate embedding for user data
    const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
    const userText = this.formatJobText(userData);
    const { embedding: userEmbedding } = await model.embedContent(userText);

    // Calculate job similarities
    const jobsWithSimilarity = this.jobs
      .map(job => ({
        ...job,
        similarity: this.cosineSimilarity(userEmbedding.values, job.embedding || [])
      }))
      .filter(job => job.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);

    // Select top 3 most similar jobs
    const topJobs = jobsWithSimilarity.slice(0, 3);

    // Generate AI suggestion using Gemini
    return this.generateAISuggestion(userData, topJobs);
  }

  // Generate detailed job suggestion using Gemini
  async generateAISuggestion(userData, topJobs) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      User Profile:
      Skills: ${userData.Skills}
      Education: ${userData.Education}
      Courses: ${userData.Courses}
      Interests: ${userData.Interests}

      Top Matching Jobs:
      ${topJobs.map((job, index) => `
        Job ${index + 1}:
        Job Title: ${job.Job}
        Skills: ${job.Skills}
        Similarity Score: ${job.similarity.toFixed(2)}
      `).join('\n')}

      Provide a personalized job recommendation based on the user's profile. 
      Explain why these jobs are a good fit and suggest skills to develop.
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      throw error;
    }
  }

  // Method to update a user's profile with matching jobs
  async updateProfileWithMatchingJobs(profileId) {
    try {
      console.log(`📌 Updating profile ${profileId} with matching jobs...`);
      // Get the profile
      const profile = await Profile.findById(profileId);
      if (!profile) {
        throw new Error("Profile not found");
      }

      // Format user data for matching
      const userData = {
        Skills: profile.skills.join(", "),
        Education: profile.education,
        Courses: profile.courses.join(", "),
        Interests: profile.interests.join(", ")
      };

      // Find matching jobs
      const matchingJobs = await this.findMatchingJobs(userData);
      
      // Extract job IDs
      const jobIds = matchingJobs.map(job => job._id);
      
      console.log(`📊 Found ${jobIds.length} matching jobs for profile ${profileId}`);
      
      // Update profile with matching job IDs
      profile.job = jobIds;
      await profile.save();
      
      console.log(`✅ Updated profile ${profileId} with matching jobs`);
      return { success: true, matchCount: jobIds.length };
    } catch (error) {
      console.error("❌ Error updating profile with matching jobs:", error);
      throw error;
    }
  }

  // Find matching jobs based on user data
  async findMatchingJobs(userData) {
    console.log(`📌 Finding matching jobs for user...`);
    // Ensure data is loaded
    if (!this.isDataLoaded) {
      await this.initializeJobData();
    }

    // Generate embedding for user data
    const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
    const userText = this.formatJobText(userData);
    const { embedding: userEmbedding } = await model.embedContent(userText);

    // Calculate job similarities
    const jobsWithSimilarity = this.jobs
      .map(job => ({
        ...job,
        similarity: this.cosineSimilarity(userEmbedding.values, job.embedding || [])
      }))
      .filter(job => job.similarity > 0.7) // Only consider jobs with high similarity
      .sort((a, b) => b.similarity - a.similarity);

    console.log(`📊 Found ${jobsWithSimilarity.length} jobs with similarity > 0.7`);
    
    // Get actual job documents from database
    const jobTitles = jobsWithSimilarity.map(job => job.Job);
    const matchingJobs = await Job.find({ title: { $in: jobTitles } });
    
    console.log(`📊 Found ${matchingJobs.length} matching jobs in database`);
    return matchingJobs;
  }

  // Update all profiles when a new job is added
  async updateProfilesForNewJob(jobId) {
    try {
      console.log(`📌 Updating profiles for new job ${jobId}...`);
      // Get the job
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error("Job not found");
      }

      // Create job data for matching
      const jobData = {
        Job: job.title,
        Skills: job.skillsRequired.join(", "),
        Education: job.educationRequired.map(edu => `${edu.degree} in ${edu.field}`).join(", "),
        Courses: job.coursesPreferred.map(course => course.courseName).join(", "),
        Interests: job.interests.join(", ")
      };

      // Generate embedding for job
      const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
      const jobText = this.formatJobText(jobData);
      const { embedding: jobEmbedding } = await model.embedContent(jobText);

      // Find all profiles
      const profiles = await Profile.find();
      console.log(`📊 Processing ${profiles.length} profiles for job matching`);
      
      const updatedProfiles = [];

      // For each profile, check if the job is a match
      for (const profile of profiles) {
        // Format profile data
        const profileData = {
          Skills: profile.skills.join(", "),
          Education: profile.education,
          Courses: profile.courses.join(", "),
          Interests: profile.interests.join(", ")
        };

        // Generate embedding for profile
        const profileText = this.formatJobText(profileData);
        const { embedding: profileEmbedding } = await model.embedContent(profileText);

        // Calculate similarity
        const similarity = this.cosineSimilarity(jobEmbedding.values, profileEmbedding.values);

        // If similarity is above threshold, add job to profile
        if (similarity > 0.7) {
          console.log(`📊 Found match with similarity ${similarity.toFixed(2)} for profile ${profile._id}`);
          // Only add if not already in the list
          if (!profile.job.includes(jobId)) {
            profile.job.push(jobId);
            await profile.save();
            updatedProfiles.push(profile._id);
          }
        }
      }

      console.log(`✅ Updated ${updatedProfiles.length} profiles with new job ${jobId}`);
      return { success: true, updatedProfiles };
    } catch (error) {
      console.error("❌ Error updating profiles for new job:", error);
      throw error;
    }
  }

  // Add a new job to the embedding database
  async addJobToEmbeddingDatabase(job) {
    try {
      console.log(`📌 Adding job ${job._id} to embedding database...`);
      // Format job data for embedding
      const jobData = {
        Job: job.title,
        Skills: job.skillsRequired.join(", "),
        Education: job.educationRequired.map(edu => `${edu.degree} in ${edu.field}`).join(", "),
        Courses: job.coursesPreferred.map(course => course.courseName).join(", "),
        Interests: job.interests.join(", ")
      };

      // Generate embedding
      const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
      const jobText = this.formatJobText(jobData);
      const { embedding } = await model.embedContent(jobText);

      // Add to jobs array with embedding
      const jobWithEmbedding = {
        ...jobData,
        _id: job._id,
        embedding: embedding.values
      };

      this.jobs.push(jobWithEmbedding);
      console.log(`✅ Added job ${job._id} to embedding database`);

      return { success: true };
    } catch (error) {
      console.error("❌ Error adding job to embedding database:", error);
      throw error;
    }
  }
}

// Create and export singleton instance
const jobService = new JobService();
module.exports = jobService;