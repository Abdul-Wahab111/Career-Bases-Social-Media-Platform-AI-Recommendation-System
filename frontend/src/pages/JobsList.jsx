import React, { useState, useEffect } from "react";
import JobsFilter from "../components/Jobs/JobsFilter";
import JobCard from "../components/Jobs/JobCard";
import JobDetail from "../components/Jobs/JobDetail";
import SearchBar from "../components/Jobs/SearchBar";
import axios from "axios";
import { toast } from "react-toastify";

const JobsList = () => {
  // State management
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    skills: [],
    salary: { min: 0, max: 1000000 },
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/jobs", {
          headers: { Accept: "application/json" },
        });
  
        if (response.data && Array.isArray(response.data)) {
          setJobs(response.data);
          setFilteredJobs(response.data);
        } else {
          console.error("Unexpected API response:", response.data);
          toast.error("Unexpected response from server.");
        }
      } catch (error) {
        console.error("Error fetching jobs:", error.response?.data || error.message);
        toast.error("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchJobs();
  }, []);
  

  // Apply filters and search
  useEffect(() => {
    let results = Array.isArray(jobs) ? jobs : [];

    // Apply search term
    if (searchTerm) {
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (filters.location) {
      results = results.filter((job) =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply skills filter
    if (filters.skills.length > 0) {
      results = results.filter((job) =>
        filters.skills.some((skill) =>
          job.skillsRequired.some((jobSkill) =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Apply salary filter
    if (filters.salary.min > 0 || filters.salary.max < 1000000) {
      results = results.filter(
        (job) => job.salary >= filters.salary.min && job.salary <= filters.salary.max
      );
    }

    setFilteredJobs(results);
  }, [jobs, filters, searchTerm]);

  // Debugging logs
  useEffect(() => {
    console.log("Filtered Jobs:", filteredJobs);
  }, [filteredJobs]);

  // Handle job selection
  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Jobs Listing Section (Left) */}
      <div className="w-2/3 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Job Listings</h1>

        {/* Search and Filters */}
        <div className="mb-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="mb-6">
          <JobsFilter onFilterChange={handleFilterChange} />
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : Array.isArray(filteredJobs) && filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isSelected={selectedJob && selectedJob._id === job._id}
                onClick={() => handleJobSelect(job)}
              />
            ))
          ) : (
            <div className="text-center p-8 bg-white rounded-lg shadow">
              <p className="text-lg text-gray-600">
                No jobs match your criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Job Details Section (Right) */}
      <div className="w-1/3 bg-white border-l border-gray-200 overflow-y-auto">
        {selectedJob ? (
          <JobDetail job={selectedJob} />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">
            <p>Select a job to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsList;
