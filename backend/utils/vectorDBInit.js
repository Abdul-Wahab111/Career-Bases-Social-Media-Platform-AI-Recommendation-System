// utils/vectorDBInit.js
const { initVectorDB } = require('../services/jobEmbeddingService');

// Initialize vector database on server startup
const initializeVectorDB = async () => {
  try {
    console.log("🚀 Initializing vector database...");
    await initVectorDB();
    console.log("✅ Vector database initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize vector database:", error);
    // Don't crash the server, but log the error
  }
};

module.exports = { initializeVectorDB };