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
  const [isMobileView, setIsMobileView] = useState(false);
  const [showDetailsMobile, setShowDetailsMobile] = useState(false);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  // Handle job selection
  const handleJobSelect = (job) => {
    setSelectedJob(job);
    if (isMobileView) {
      setShowDetailsMobile(true);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle back button in mobile view
  const handleBackToList = () => {
    setShowDetailsMobile(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Jobs Listing Section */}
      <div className={`${isMobileView && showDetailsMobile ? 'hidden' : 'block'} 
                      w-full lg:w-2/3 p-4 lg:p-6 overflow-y-auto`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                Job Listings
              </span>
            </h1>
            <div className="text-sm text-gray-500">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 transition-all duration-300 hover:shadow-md">
            <SearchBar onSearch={handleSearch} />
            <div className="mt-4">
              <JobsFilter onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Loading opportunities...</p>
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
              <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl font-medium text-gray-700 mb-2">
                  No matching jobs found
                </p>
                <p className="text-gray-500">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Details Section */}
      <div className={`${isMobileView && !showDetailsMobile ? 'hidden' : 'block'} 
                      w-full lg:w-1/3 bg-white border-l border-gray-200 overflow-y-auto shadow-lg lg:shadow-none`}>
        {isMobileView && selectedJob && (
          <button 
            onClick={handleBackToList}
            className="flex items-center p-4 text-indigo-600 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to listings
          </button>
        )}
        
        {selectedJob ? (
          <JobDetail job={selectedJob} />
        ) : (
          <div className="flex flex-col justify-center items-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xl font-medium text-gray-700 mb-2">No job selected</p>
            <p className="text-gray-500 max-w-xs">
              Select a job from the list to view its details and apply
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsList;
