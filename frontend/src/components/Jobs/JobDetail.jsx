"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import ApplicationForm from "./ApplicationForm"

const JobDetail = ({ job }) => {
  const [activeTab, setActiveTab] = useState("description")
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("token")
  }

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Check if user has already applied
  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        setIsLoading(true)
        const token = getAuthToken()
        
        if (!token) {
          setIsLoading(false)
          return
        }
        
        const response = await axios.get(
          `http://localhost:5000/api/jobs/${job._id}/application-status`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        setHasApplied(response.data.hasApplied)
      } catch (error) {
        console.error("Error checking application status:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkApplicationStatus()
  }, [job._id])

  const handleApplicationSuccess = () => {
    setHasApplied(true)
    setShowApplyForm(false)
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{job.title}</h1>
              <div className="flex items-center">
                <h2 className="text-xl text-gray-700">{job.company}</h2>
                {job.isVerified && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex items-center text-gray-600 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {job.location}
                {job.isRemote && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Remote
                  </span>
                )}
              </div>
            </div>

            {job.salary && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
                ${job.salary.toLocaleString()}
                <span className="text-xs ml-1 opacity-80">per year</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center text-sm text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Posted: {formatDate(job.createdAt)}
            </div>

            <div className="flex items-center text-sm text-gray-500 ml-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {job.applicants.length} applicant{job.applicants.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <button
                disabled
                className="w-full py-3 px-4 bg-gray-300 text-gray-600 font-medium rounded-lg flex items-center justify-center"
              >
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking Application Status...
              </button>
            ) : hasApplied ? (
              <div className="w-full py-3 px-4 bg-green-100 text-green-800 font-medium rounded-lg shadow-md flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                You have already applied for this position
              </div>
            ) : (
              <button
                onClick={() => setShowApplyForm(!showApplyForm)}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                {showApplyForm ? "Hide Application Form" : "Apply Now"}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors duration-200 ${
              activeTab === "description"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors duration-200 ${
              activeTab === "requirements"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("requirements")}
          >
            Requirements
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors duration-200 ${
              activeTab === "company"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("company")}
          >
            Company
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold mb-3">Job Description</h3>
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">{job.description}</div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <h4 className="font-medium text-indigo-800 mb-2">Key Responsibilities</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Develop and maintain high-quality software</li>
                <li>Collaborate with cross-functional teams</li>
                <li>Write clean, maintainable, and efficient code</li>
                <li>Participate in code reviews and provide constructive feedback</li>
                <li>Troubleshoot and debug applications</li>
              </ul>
            </div>
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === "requirements" && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Education Required</h3>
              <ul className="space-y-2">
                {job.educationRequired.map((edu, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-500 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                      />
                    </svg>
                    <div>
                      <span className="font-medium text-gray-800">{edu.degree}</span> in{" "}
                      <span className="text-gray-700">{edu.field}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {job.coursesPreferred && job.coursesPreferred.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Preferred Courses</h3>
                <ul className="space-y-2">
                  {job.coursesPreferred.map((course, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-green-500 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <span className="font-medium text-gray-800">{course.courseName}</span>
                        {course.provider && <span className="text-gray-600"> ({course.provider})</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.interests && job.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Relevant Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {job.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Company Tab */}
        {activeTab === "company" && (
          <div className="animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-gray-600">{job.company.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{job.company}</h3>
                <p className="text-gray-600">{job.location}</p>
              </div>
            </div>

            <div className="prose max-w-none text-gray-700">
              <p>
                {job.companyDescription ||
                  `${job.company} is a leading company in the ${job.industry || "technology"} industry, known for innovation and excellence in their field.`}
              </p>

              <h4 className="text-lg font-semibold mt-6 mb-3">Why work with us?</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-green-500 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Competitive salary and benefits package</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-green-500 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Professional development opportunities</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-green-500 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Collaborative and innovative work environment</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-green-500 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Work-life balance with flexible scheduling options</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Application Form */}
        {showApplyForm && !hasApplied && (
          <div className="mt-8 border-t pt-6 animate-slideDown">
            <ApplicationForm jobId={job._id} onApplicationSuccess={handleApplicationSuccess} />
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetail