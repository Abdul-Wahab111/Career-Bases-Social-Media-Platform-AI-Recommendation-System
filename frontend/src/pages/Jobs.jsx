import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Layout from "../components/Layout";
import CreateJob from "../components/Jobs/CreateJob";
import JobList from "../components/jobs/JobList";
import ApplicantsList from "../components/Jobs/ApplicantsList";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [userId, setUserId] = useState(null);

  // Fetch logged-in user's ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const decoded = jwtDecode(token);
        const id = decoded._id || decoded.id;
        setUserId(id);
      }
    } catch (error) {
      console.error("Token decode error:", error);
    }
  }, []);

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  // Fetch jobs when userId is available
  useEffect(() => {
    if (userId) {
      fetchJobs();
    }
  }, [userId]);

  // Edit Job
  const handleEditJob = async (jobId, updatedJobData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/jobs/${jobId}`,
        updatedJobData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchJobs();
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Pass fetchJobs to CreateJob */}
        <CreateJob userId={userId} fetchJobs={fetchJobs} />
        
        {/* Pass fetchJobs to JobList */}
        <JobList 
          jobs={jobs} 
          fetchJobs={fetchJobs} 
          userId={userId} 
          onEditJob={handleEditJob} 
          onDeleteJob={handleDeleteJob} 
        />
        {/* <ApplicantsList jobs={jobs}/> */}
      </div>
    </Layout>
  );
};

export default Jobs;
