import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const JobDetail = ({ job }) => {
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle resume file upload
  const handleResumeChange = (e) => {
    if (e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );
      
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload resume. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle job application submission
  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!resume) {
      toast.error('Please upload your resume');
      return;
    }
    
    try {
      setIsApplying(true);
      
      // Upload resume to Cloudinary
      const resumeUrl = await uploadToCloudinary(resume);
      
      // Get the auth token
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to apply for this job');
        return;
      }
      
      // Submit application with authorization header
      const response = await axios.post(
        `http://localhost:5000/api/jobs/${job._id}/apply`, 
        {
          resume: resumeUrl,
          coverLetter,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Application submitted successfully!');
      setResume(null);
      setCoverLetter('');
      
      // Reset file input
      const fileInput = document.getElementById('resume-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error applying for job:', error);
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Rest of your component remains the same */}
      {/* Header */}
      <div className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
        <h2 className="text-xl text-gray-700">{job.company}</h2>
        <div className="flex items-center text-gray-600 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </div>
        
        {job.salary && (
          <div className="mt-2 inline-block bg-green-100 px-3 py-1 rounded-full text-green-800 font-medium">
            ${job.salary.toLocaleString()} per year
          </div>
        )}
        
        <div className="mt-3 text-sm text-gray-500">
          Posted: {formatDate(job.createdAt)}
        </div>
      </div>
      
      {/* Job Description */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <div className="whitespace-pre-line text-gray-700">
          {job.description}
        </div>
      </div>
      
      {/* Skills Required */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Skills Required</h3>
        <div className="flex flex-wrap gap-2">
          {job.skillsRequired.map((skill, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {/* Education Requirements */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Education Required</h3>
        <ul className="list-disc pl-5 space-y-1">
          {job.educationRequired.map((edu, index) => (
            <li key={index} className="text-gray-700">
              {edu.degree} in {edu.field}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Preferred Courses */}
      {job.coursesPreferred && job.coursesPreferred.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Preferred Courses</h3>
          <ul className="list-disc pl-5 space-y-1">
            {job.coursesPreferred.map((course, index) => (
              <li key={index} className="text-gray-700">
                {course.courseName}{course.provider ? ` (${course.provider})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Interests */}
      {job.interests && job.interests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Relevant Interests</h3>
          <div className="flex flex-wrap gap-2">
            {job.interests.map((interest, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Application Form */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-bold mb-4">Apply for this position</h3>
        <form onSubmit={handleApply}>
          {/* Resume Upload */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Resume (PDF)
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
              className="block w-full text-gray-700 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {isUploading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Uploading: {uploadProgress}%</p>
              </div>
            )}
          </div>
          
          {/* Cover Letter */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Cover Letter
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Why are you a good fit for this role?"
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isApplying || isUploading}
            className={`w-full py-3 rounded font-medium ${
              isApplying || isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isApplying ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobDetail;