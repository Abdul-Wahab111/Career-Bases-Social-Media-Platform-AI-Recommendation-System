const { GoogleGenAI } = require("@google/genai");
const { Pinecone } = require('@pinecone-database/pinecone');
const dotenv = require('dotenv');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  // The controller URL should not include any index name
  controllerHostUrl: "https://api.pinecone.io"
});

// Queue system to manage API requests
const requestQueue = [];
const MAX_CONCURRENT_REQUESTS = 3; // Reduced to avoid rate limiting
let activeRequests = 0;
let isProcessing = false;

// Process the next request in the queue
const processNextRequest = async () => {
  if (isProcessing || requestQueue.length === 0 || activeRequests >= MAX_CONCURRENT_REQUESTS) return;
  
  isProcessing = true;
  activeRequests++;
  const nextRequest = requestQueue.shift();
  
  try {
    await nextRequest.handler();
    nextRequest.resolve();
  } catch (error) {
    console.error("Error processing queue request:", error.message);
    nextRequest.reject(error);
  } finally {
    activeRequests--;
    isProcessing = false;
    // Add exponential backoff
    setTimeout(processNextRequest, 200 + (Math.random() * 300)); // Randomized delay between 200-500ms
  }
};

// Add request to the queue
const queueRequest = (handler) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ handler, resolve, reject });
    if (!isProcessing) processNextRequest();
  });
};

// Initialize the vector database connection
const initVectorDB = async () => {
  try {
    console.log("Connecting to Pinecone...");
    
    // Check if index exists and create if not
    const indexName = 'job-embeddings';
    const indexList = await pinecone.listIndexes();
    
    if (!indexList.indexes.some(idx => idx.name === indexName)) {
      console.log(`Creating new Pinecone index: ${indexName}`);
      await pinecone.createIndex({
        name: indexName,
        dimension: 768, // Embedding dimension for text-embedding-004
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'  // Choose a region available in your account
          }
        }
      });
      
      // Load initial data from CSV
      await loadInitialJobData();
    }  
    console.log("✅ Connected to Pinecone");
    return pinecone.index(indexName);
  } catch (error) {
    console.error("❌ Failed to initialize vector database:", error);
    throw error;
  }
};

// Load initial job data from CSV
const loadInitialJobData = async () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvFilePath = path.join(process.cwd(), 'job.csv');
    
    if (!fs.existsSync(csvFilePath)) {
      console.log("📊 No initial CSV file found - skipping data loading");
      return resolve();
    }
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          console.log(`📊 Loaded ${results.length} job records from CSV`);
          
          // Process in batches to prevent overloading
          const BATCH_SIZE = 5;
          for (let i = 0; i < results.length; i += BATCH_SIZE) {
            const batch = results.slice(i, i + BATCH_SIZE);
            
            await Promise.all(batch.map(async (job) => {
              try {
                const embedding = await generateEmbedding(job);
                await addEmbeddingToPinecone(job.id || `csv-job-${results.indexOf(job)}`, embedding, job);
              } catch (err) {
                console.error(`Error processing CSV job ${i}:`, err.message);
              }
            }));
            
            // Add delay between batches
            if (i + BATCH_SIZE < results.length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          resolve();
        } catch (error) {
          console.error("Error loading initial job data:", error.message);
          reject(error);
        }
      })
      .on('error', (err) => {
        console.error("Error reading CSV:", err.message);
        reject(err);
      });
  });
};

// Generate embeddings using Gemini API
const generateEmbedding = async (jobData) => {
  return queueRequest(async () => {
    try {
      // Prepare the content for embedding
      const content = `
        Job Skills: ${Array.isArray(jobData.skillsRequired) ? jobData.skillsRequired.join(', ') : jobData.skillsRequired || jobData.skill || ''}
        Education: ${jobData.educationRequired || jobData.education || ''}
        Courses: ${Array.isArray(jobData.coursesPreferred) ? jobData.coursesPreferred.join(', ') : jobData.coursesPreferred || jobData.courses || ''}
        Interests: ${Array.isArray(jobData.interests) ? jobData.interests.join(', ') : jobData.interests || ''}
      `;
      
      // Use ai.models.embedContent as shown in the documentation
      const response = await genAI.models.embedContent({
        model: 'models/text-embedding-004',  // or 'gemini-embedding-exp-03-07' as in your example
        contents: content
      });
      
      return response.embeddings[0].values;
    } catch (error) {
      console.error("Error generating embedding:", error.message);
      throw error;
    }
  });
};

// Add embedding to Pinecone
const addEmbeddingToPinecone = async (id, embedding, metadata) => {
  try {
    const index = await initVectorDB();
    await index.upsert({
      vectors: [{
        id: id.toString(),
        values: embedding,
        metadata
      }]
    });
    console.log(`✅ Added embedding for job: ${id}`);
  } catch (error) {
    console.error(`❌ Error adding embedding to Pinecone: ${error.message}`);
    throw error;
  }
};

module.exports = {
  initVectorDB,
  generateEmbedding,
  addEmbeddingToPinecone
};