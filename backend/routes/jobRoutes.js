// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Route to initialize jobs
router.post('/initialize', jobController.initializeJobs);

// Route to get job suggestion
router.post('/suggest', jobController.getJobSuggestion);

module.exports = router;