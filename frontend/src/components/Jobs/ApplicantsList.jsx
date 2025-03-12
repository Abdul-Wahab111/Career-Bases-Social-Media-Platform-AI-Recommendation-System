import { useState } from "react";

const ApplicantsList = ({ jobData }) => {
  // Check if jobData exists first, then check for jobs property
  const [job, setJob] = useState(() => {
    if (!jobData) return null;
    return jobData.jobs ? jobData.jobs[0] : jobData;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusChange = async (applicantId, newStatus) => {
    if (!job) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/jobs/${job._id}/applicants/${applicantId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update applicant status");
      }

      // Update local state
      setJob(prevJob => ({
        ...prevJob,
        applicants: prevJob.applicants.map(applicant => 
          applicant.user._id === applicantId 
            ? { ...applicant, status: newStatus } 
            : applicant
        )
      }));
      setLoading(false);
    } catch (err) {
      console.error("Error updating applicant status:", err);
      setError("Error updating applicant status");
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 py-4">Error: {error}</div>;
  if (!job) return <div className="text-center py-8">No job data available</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Applicants for: {job.title}</h2>
      
      {job.applicants && job.applicants.length > 0 ? (
        <div className="space-y-8">
          {job.applicants.map((applicant) => (
            <div 
              key={applicant.user._id} 
              className="border p-4 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{applicant.user.name || "Unnamed Applicant"}</h3>
                  <p className="text-gray-600">{applicant.user.email}</p>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      applicant.status === "Accepted" ? "bg-green-100 text-green-800" : 
                      applicant.status === "Rejected" ? "bg-red-100 text-red-800" : 
                      "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {applicant.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {/* Document Links */}
                <div className="space-y-2">
                  {applicant.resume && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Resume:</p>
                      <a 
                        href={applicant.resume} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Resume
                      </a>
                    </div>
                  )}
                  
                  {applicant.coverLetter && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Cover Letter:</p>
                      <a 
                        href={applicant.coverLetter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Cover Letter
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex flex-col md:items-end justify-center space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(applicant.user._id, "Accepted")}
                      disabled={applicant.status === "Accepted"}
                      className={`px-3 py-2 rounded text-white ${
                        applicant.status === "Accepted" 
                          ? "bg-gray-300 cursor-not-allowed" 
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(applicant.user._id, "Rejected")}
                      disabled={applicant.status === "Rejected"}
                      className={`px-3 py-2 rounded text-white ${
                        applicant.status === "Rejected" 
                          ? "bg-gray-300 cursor-not-allowed" 
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                  <button
                    onClick={() => handleStatusChange(applicant.user._id, "Pending")}
                    disabled={applicant.status === "Pending"}
                    className={`px-3 py-2 rounded text-white ${
                      applicant.status === "Pending" 
                        ? "bg-gray-300 cursor-not-allowed" 
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    Reset to Pending
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">
          <p>No applicants have applied for this job yet.</p>
        </div>
      )}
    </div>
  );
};

// Set default props to prevent undefined errors
ApplicantsList.defaultProps = {
  jobData: null
};

export default ApplicantsList;