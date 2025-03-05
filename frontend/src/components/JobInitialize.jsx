import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JobInitializer = () => {
  const [progress, setProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);

  const initializeJobs = async () => {
    setIsInitializing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/jobs/initialize');
      setTotalJobs(response.data.totalJobs);
    } catch (error) {
      console.error('Initialization failed', error);
    }
  };

  useEffect(() => {
    // Setup EventSource for progress tracking
    const eventSource = new EventSource('http://localhost:5000/api/jobs/progress');
    
    eventSource.onmessage = (event) => {
      const progressData = JSON.parse(event.data);
      setProgress(progressData.progress);
      
      if (progressData.progress === 100) {
        setIsInitializing(false);
        eventSource.close();
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <button 
        onClick={initializeJobs} 
        disabled={isInitializing}
      >
        {isInitializing ? 'Initializing...' : 'Initialize Jobs'}
      </button>
      {isInitializing && (
        <div>
          <p>Initializing Jobs: {progress}%</p>
          <progress value={progress} max="100" />
        </div>
      )}
    </div>
  );
};

export default JobInitializer;