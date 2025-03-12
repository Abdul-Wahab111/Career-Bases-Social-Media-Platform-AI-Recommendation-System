import React from 'react';

const JobCard = ({ job, isSelected, onClick }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days ago
  const getDaysAgo = (dateString) => {
    const posted = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - posted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div 
      className={`p-5 rounded-xl shadow-sm cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-indigo-50 border-2 border-indigo-500 transform scale-[1.01]' 
          : 'bg-white hover:shadow-md hover:translate-y-[-2px]'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">{job.title}</h2>
            {job.isRemote && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Remote
              </span>
            )}
            {job.isUrgent && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Urgent
              </span>
            )}
          </div>
          <div className="flex items-center mt-1">
            <h3 className="text-lg text-gray-700">{job.company}</h3>
            {job.isVerified && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex items-center text-gray-600 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </div>
        </div>
        
        {job.salary && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
            ${job.salary.toLocaleString()}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-gray-600 line-clamp-2 text-sm">{job.description}</p>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {job.skillsRequired.slice(0, 3).map((skill, index) => (
          <span 
            key={index} 
            className="px-2.5 py-1 bg-gray-100 text-xs font-medium text-gray-800 rounded-full transition-colors hover:bg-indigo-100 hover:text-indigo-800"
          >
            {skill}
          </span>
        ))}
        {job.skillsRequired.length > 3 && (
          <span className="px-2.5 py-1 bg-gray-100 text-xs font-medium text-gray-800 rounded-full">
            +{job.skillsRequired.length - 3} more
          </span>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span title={formatDate(job.createdAt)}>{getDaysAgo(job.createdAt)}</span>
        </div>
        
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>
            {job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="hidden sm:flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{Math.floor(Math.random() * 100) + 20} views</span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
