import React from 'react';

const JobCard = ({ job, isSelected, onClick }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div 
      className={`p-4 rounded-lg shadow cursor-pointer transition-all ${
        isSelected ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
          <h3 className="text-lg text-gray-700">{job.company}</h3>
          <p className="text-gray-600">{job.location}</p>
        </div>
        {job.salary && (
          <div className="bg-green-100 px-3 py-1 rounded-full text-green-800 font-medium">
            ${job.salary.toLocaleString()}
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <p className="text-gray-600 line-clamp-2">{job.description}</p>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {job.skillsRequired.slice(0, 3).map((skill, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-sm rounded">
            {skill}
          </span>
        ))}
        {job.skillsRequired.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-sm rounded">
            +{job.skillsRequired.length - 3} more
          </span>
        )}
      </div>
      
      <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
        <span>Posted: {formatDate(job.createdAt)}</span>
        <span>{job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};

export default JobCard;