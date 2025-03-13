"use client"

import { useState } from "react"

const JobList = ({ jobs, fetchJobs }) => {
  const [editingJob, setEditingJob] = useState(null);
  const [updatedJob, setUpdatedJob] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    skillsRequired: "",
    educationRequired: "",
    coursesPreferred: "",
    interests: "",
  });
  const [showApplicants, setShowApplicants] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Ensure jobs is always an array
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  
  // Filter jobs based on search term
  const filteredJobs = safeJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Edit Click
  const handleEdit = (job) => {
    setEditingJob(job._id);
    setUpdatedJob({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      salary: job.salary || "",
      skillsRequired: job.skillsRequired?.join(", ") || "",
      educationRequired:
        job.educationRequired
          ?.map((edu) => `${edu.degree} in ${edu.field}`)
          .join(", ") || "",
      coursesPreferred:
        job.coursesPreferred
          ?.map((course) =>
            course.provider ? `${course.courseName} (${course.provider})` : course.courseName
          )
          .join(", ") || "",
      interests: job.interests?.join(", ") || "",
    });
  };

  // Handle Input Change
  const handleChange = (e) => {
    setUpdatedJob({ ...updatedJob, [e.target.name]: e.target.value });
  };

  // Handle Update
  const handleUpdate = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...updatedJob,
          skillsRequired: updatedJob.skillsRequired.split(",").map((s) => s.trim()),
          educationRequired: updatedJob.educationRequired
            .split(",")
            .map((edu) => {
              const [degree, field] = edu.split(" in ");
              return { degree: degree.trim(), field: field?.trim() || "" };
            }),
          coursesPreferred: updatedJob.coursesPreferred
            .split(",")
            .map((c) => {
              const match = c.match(/$$(.*?)$$/);
              return match
                ? { courseName: c.replace(`(${match[1]})`, "").trim(), provider: match[1].trim() }
                : { courseName: c.trim() };
            }),
          interests: updatedJob.interests.split(",").map((i) => i.trim()),
        }),
      });

      if (!response.ok) throw new Error("Failed to update job");

      setEditingJob(null);
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error("Error updating job:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete job");

      setConfirmDelete(null);
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle applicants visibility
  const toggleApplicants = (jobId) => {
    setShowApplicants(showApplicants === jobId ? null : jobId);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interviewing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Job Management Dashboard
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="all">All Jobs</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {safeJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-xl font-medium text-gray-700 mb-2">No jobs available</p>
            <p className="text-gray-500 mb-6">Start by creating your first job posting</p>
            {/* <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Create New Job
            </button> */}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                {editingJob === job._id ? (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Edit Job</h3>
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          onClick={() => setEditingJob(null)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          name="title"
                          value={updatedJob.title}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          name="company"
                          value={updatedJob.company}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={updatedJob.location}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                        <input
                          type="text"
                          name="salary"
                          value={updatedJob.salary}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={updatedJob.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required (comma separated)</label>
                      <input
                        type="text"
                        name="skillsRequired"
                        value={updatedJob.skillsRequired}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Education Required (e.g. "Bachelor's in Computer Science")</label>
                      <input
                        type="text"
                        name="educationRequired"
                        value={updatedJob.educationRequired}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Courses Preferred (e.g. "Web Development (Udemy)")</label>
                      <input
                        type="text"
                        name="coursesPreferred"
                        value={updatedJob.coursesPreferred}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interests (comma separated)</label>
                      <input
                        type="text"
                        name="interests"
                        value={updatedJob.interests}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        onClick={() => setEditingJob(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={() => handleUpdate(job._id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-1">
                            <h3 className="text-xl font-bold text-gray-800 mr-2">{job.title}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {job.status || 'Active'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-1">{job.company} • {job.location}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Posted: {formatDate(job.createdAt || new Date())}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                            onClick={() => handleEdit(job)}
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                            onClick={() => setConfirmDelete(job._id)}
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Confirmation Dialog */}
                      {confirmDelete === job._id && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
                            <p className="text-gray-700 mb-4">Are you sure you want to delete this job? This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                              <button
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                onClick={() => setConfirmDelete(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                onClick={() => handleDelete(job._id)}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete Job'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <div className="flex border-b border-gray-200">
                          <button 
                            className={`py-2 px-4 font-medium text-sm transition-colors duration-200 ${
                              activeTab === 'details' 
                                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('details')}
                          >
                            Details
                          </button>
                          <button 
                            className={`py-2 px-4 font-medium text-sm transition-colors duration-200 flex items-center ${
                              activeTab === 'applicants' 
                                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('applicants')}
                          >
                            Applicants
                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                              {job.applicants?.length || 0}
                            </span>
                          </button>
                        
                        </div>

                        {activeTab === 'details' && (
                          <div className="py-4 animate-fadeIn">
                            <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Salary</h4>
                                <p className="text-gray-800 font-medium">{job.salary ? `$${job.salary.toLocaleString()}` : 'Not specified'}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Applications</h4>
                                <p className="text-gray-800 font-medium">{job.applicants?.length || 0} applicants</p>
                              </div>
                            </div>

                            {job.skillsRequired?.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills Required</h4>
                                <div className="flex flex-wrap gap-2">
                                  {job.skillsRequired.map((skill, index) => (
                                    <span 
                                      key={index} 
                                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'applicants' && (
                          <div className="py-4 animate-fadeIn">
                            {job.applicants?.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                                      {/* <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                                     
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {job.applicants.map((applicant) => (
                                      <tr key={applicant._id} className="hover:bg-gray-50">
                                        <td className="px-3 py-4 whitespace-nowrap">
                                          <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-medium">
                                              {applicant.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="ml-3">
                                              <div className="text-sm font-medium text-gray-900">{applicant.user?.name}</div>
                                              <div className="text-sm text-gray-500">{applicant.user?.email}</div>
                                            </div>
                                          </div>
                                        </td>
                                        {/* <td className="px-3 py-4 whitespace-nowrap">
                                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(applicant.status)}`}>
                                            {applicant.status || 'Pending'}
                                          </span>
                                        </td> */}
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {formatDate(applicant.createdAt || new Date())}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                                          <a
                                            href={applicant.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 flex items-center"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                              View Resume
                                            </a>
                                          </td>
                                          
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <p className="text-gray-600 mb-1">No applicants yet</p>
                                  <p className="text-sm text-gray-500">When candidates apply, they'll appear here</p>
                                </div>
                              )}
                            </div>
                          )}

                          
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

export default JobList;

