import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Layout from "../components/Layout";
import { UserPlus, UserMinus, Loader, AlertCircle, User } from 'lucide-react';

const ProfilesList = () => {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // Initialize useNavigate

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        // Get current user
        const currentUserResponse = await api.get("/users/me");
        setCurrentUser(currentUserResponse.data);
        
        // Get profiles
        const profilesResponse = await api.get("/profiles");
        setProfiles(profilesResponse.data);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadData();
    }
  }, [token]);

  const handleFollow = async (userId) => {
    if (actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await api.post(`/users/follow/${userId}`);
      
      // Show success message
      setActionMessage("Successfully followed user");
      setTimeout(() => setActionMessage(""), 3000);
      
      // Update current user and profiles
      const userResponse = await api.get("/users/me");
      setCurrentUser(userResponse.data);
      
      const profilesResponse = await api.get("/profiles");
      setProfiles(profilesResponse.data);
    } catch (error) {
      console.error("Error following user:", error);
      setActionMessage("Failed to follow user. Please try again.");
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleUnfollow = async (userId) => {
    if (actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await api.post(`/users/unfollow/${userId}`);
      
      // Show success message
      setActionMessage("Successfully unfollowed user");
      setTimeout(() => setActionMessage(""), 3000);
      
      // Update current user and profiles
      const userResponse = await api.get("/users/me");
      setCurrentUser(userResponse.data);
      
      const profilesResponse = await api.get("/profiles");
      setProfiles(profilesResponse.data);
    } catch (error) {
      console.error("Error unfollowing user:", error);
      setActionMessage("Failed to unfollow user. Please try again.");
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  const isFollowing = (userId) => {
    return currentUser?.following?.some(id => id.toString() === userId.toString());
  };

  // Filter profiles based on search term
  const filteredProfiles = searchTerm 
    ? profiles.filter(profile => 
        profile.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : profiles;

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg">Loading profiles...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <div className="flex items-center text-red-600 dark:text-red-400 mb-2">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Discover People
          </h1>
          
          {/* Search input */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name, bio, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 pl-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Action message notification */}
        {actionMessage && (
          <div 
            className={`p-4 rounded-lg mb-6 flex items-center shadow-sm transition-all ${
              actionMessage.includes("Failed") 
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30" 
                : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/30"
            }`}
          >
            {actionMessage.includes("Failed") ? (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {actionMessage}
          </div>
        )}
        
        {/* Profiles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile) => (
              <div
                key={profile._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer"
                onClick={() => navigate(`/profile/${profile.user._id}`)} // Add onClick handler
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Profile image */}
                    <div className="flex-shrink-0">
                      {profile.userimage ? (
                        <img
                          src={profile.userimage || "/placeholder.svg"}
                          alt={profile.user?.name || "Profile"}
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shadow-sm">
                          <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Profile info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {profile.user?.name || "Anonymous User"}
                        </h2>
                        
                        {/* Follow/unfollow button */}
                        {currentUser && profile.user && profile.user._id !== currentUser._id && (
                          <div className="flex-shrink-0">
                            {isFollowing(profile.user._id) ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent navigation when clicking the button
                                  handleUnfollow(profile.user._id);
                                }}
                                disabled={actionInProgress}
                                className={`flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all text-sm font-medium ${
                                  actionInProgress ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <UserMinus className="w-4 h-4 mr-1.5" />
                                Unfollow
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent navigation when clicking the button
                                  handleFollow(profile.user._id);
                                }}
                                disabled={actionInProgress}
                                className={`flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium ${
                                  actionInProgress ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <UserPlus className="w-4 h-4 mr-1.5" />
                                Follow
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {profile.bio || "No bio available"}
                      </p>
                      
                      {/* Follower stats */}
                      <div className="flex gap-4 mt-2 text-sm">
                        <p className="text-gray-500 dark:text-gray-400">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {profile.user?.followers?.length || 0}
                          </span> followers
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {profile.user?.following?.length || 0}
                          </span> following
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile details */}
                  <div className="mt-5 space-y-3 text-sm">
                    {profile.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="inline-flex px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {profile.education && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Education:</span>{" "}
                        {profile.education}
                      </p>
                    )}
                    
                    {profile.interests?.length > 0 && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Interests:</span>{" "}
                        {profile.interests.join(", ")}
                      </p>
                    )}
                    
                    {profile.achievements?.length > 0 && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Achievements:</span>{" "}
                        {profile.achievements.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm ? "No matching profiles found" : "No profiles available"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  {searchTerm 
                    ? `We couldn't find any profiles matching "${searchTerm}". Try a different search term.` 
                    : "There are no user profiles available at the moment."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilesList;