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
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [otherJobs, setOtherJobs] = useState([]);
  const [filteredRecommendedJobs, setFilteredRecommendedJobs] = useState([]);
  const [filteredOtherJobs, setFilteredOtherJobs] = useState([]);
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

  // Fetch jobs and profile on component mount
  useEffect(() => {
    const fetchJobsAndProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        
        // Fetch all jobs
        const jobsResponse = await axios.get("http://localhost:5000/api/jobs", {
          headers: { Accept: "application/json" },
        });
        
        // Fetch user profile
        const profileResponse = await axios.get("http://localhost:5000/api/profiles/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("Jobs fetched:", jobsResponse.data);
        console.log("Profile fetched:", profileResponse.data);
        
        if (jobsResponse.data && Array.isArray(jobsResponse.data)) {
          const allJobs = jobsResponse.data;
          setJobs(allJobs);
          
          // Get preferred job IDs from the profile
          const preferredJobIds = profileResponse.data.job || [];
          
          // Filter recommended jobs based on profile's preferred jobs
          const recommendedJobsList = allJobs.filter(job => 
            preferredJobIds.includes(job._id)
          );
          
          // Filter other jobs (excluding recommended ones)
          const otherJobsList = allJobs.filter(job => 
            !preferredJobIds.includes(job._id)
          );
          
          setRecommendedJobs(recommendedJobsList);
          setOtherJobs(otherJobsList);
          setFilteredRecommendedJobs(recommendedJobsList);
          setFilteredOtherJobs(otherJobsList);
        } else {
          console.error("Unexpected API response:", jobsResponse.data);
          toast.error("Unexpected response from server.");
        }
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
        toast.error("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchJobsAndProfile();
  }, []);
  
  // Apply filters and search to both job lists
  useEffect(() => {
    // Filter recommended jobs
    let filteredRecommended = [...recommendedJobs];
    let filteredOther = [...otherJobs];

    // Apply search term
    if (searchTerm) {
      const searchFilter = (job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      filteredRecommended = filteredRecommended.filter(searchFilter);
      filteredOther = filteredOther.filter(searchFilter);
    }

    // Apply location filter
    if (filters.location) {
      const locationFilter = (job) =>
        job.location.toLowerCase().includes(filters.location.toLowerCase());
      
      filteredRecommended = filteredRecommended.filter(locationFilter);
      filteredOther = filteredOther.filter(locationFilter);
    }

    // Apply skills filter
    if (filters.skills.length > 0) {
      const skillsFilter = (job) =>
        filters.skills.some((skill) =>
          job.skillsRequired.some((jobSkill) =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
      
      filteredRecommended = filteredRecommended.filter(skillsFilter);
      filteredOther = filteredOther.filter(skillsFilter);
    }

    // Apply salary filter
    if (filters.salary.min > 0 || filters.salary.max < 1000000) {
      const salaryFilter = (job) => 
        job.salary >= filters.salary.min && job.salary <= filters.salary.max;
      
      filteredRecommended = filteredRecommended.filter(salaryFilter);
      filteredOther = filteredOther.filter(salaryFilter);
    }

    setFilteredRecommendedJobs(filteredRecommended);
    setFilteredOtherJobs(filteredOther);
  }, [recommendedJobs, otherJobs, filters, searchTerm]);

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

  // Total job count
  const totalFilteredJobs = filteredRecommendedJobs.length + filteredOtherJobs.length;

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
              {totalFilteredJobs} {totalFilteredJobs === 1 ? 'job' : 'jobs'} found
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 transition-all duration-300 hover:shadow-md">
            <SearchBar onSearch={handleSearch} />
            <div className="mt-4">
              <JobsFilter onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading opportunities...</p>
            </div>
          ) : (
            <>
              {/* AI Recommended Jobs Section */}
              {filteredRecommendedJobs.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-indigo-600 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    Personalized AI Recommended Jobs
                  </h2>
                  <div className="space-y-4">
                    {filteredRecommendedJobs.map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        isSelected={selectedJob && selectedJob._id === job._id}
                        onClick={() => handleJobSelect(job)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Jobs Section */}
              {filteredOtherJobs.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    All Available Opportunities
                  </h2>
                  <div className="space-y-4">
                    {filteredOtherJobs.map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        isSelected={selectedJob && selectedJob._id === job._id}
                        onClick={() => handleJobSelect(job)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* No Jobs Found Message */}
              {filteredRecommendedJobs.length === 0 && filteredOtherJobs.length === 0 && (
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
            </>
          )}
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