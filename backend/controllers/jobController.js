const jobService = require('../services/jobService');

const jobController = {
  // Initialize jobs
  initializeJobs: async (req, res) => {
    try {
      await jobService.initializeJobData();
      res.status(200).json({ message: 'Job data initialized successfully' });
    } catch (error) {
      console.error('Error initializing jobs:', error);
      res.status(500).json({ error: 'Failed to initialize job data' });
    }
  },

  // Get job suggestion
  getJobSuggestion: async (req, res) => {
    try {
      const userData = req.body;
      const suggestion = await jobService.getJobSuggestion(userData);
      res.status(200).json({ suggestion });
    } catch (error) {
      console.error('Error getting job suggestion:', error);
      res.status(500).json({ error: 'Failed to get job suggestion' });
    }
  },
};

module.exports = jobController;