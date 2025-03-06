import React from "react";
import { UserCheck, UserPlus } from "lucide-react";
import axios from "axios";

const FollowButton = ({ userId, targetUserId, isFollowing, onFollowChange, disabled }) => {
  const handleFollowAction = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = isFollowing 
        ? `http://localhost:5000/api/users/unfollow/${targetUserId}` 
        : `http://localhost:5000/api/users/follow/${targetUserId}`;
      
      await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Notify parent component about the follow status change
      if (onFollowChange) {
        onFollowChange(targetUserId, !isFollowing);
      }
    } catch (error) {
      console.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user:`, error);
    }
  };

  // Don't render if it's the user's own content
  if (userId === targetUserId) {
    return null;
  }

  return (
    <button
      onClick={handleFollowAction}
      disabled={disabled}
      className={`flex items-center space-x-1 rounded-lg px-3 py-1 text-sm transition-colors ${
        isFollowing 
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isFollowing ? (
        <>
          <UserCheck size={16} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus size={16} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};

export default FollowButton;