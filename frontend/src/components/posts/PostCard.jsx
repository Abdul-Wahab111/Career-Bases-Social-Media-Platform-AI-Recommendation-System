"use client";

import { useState } from "react";
import axios from "axios";
import moment from "moment";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Edit2,
  Globe,
  Send,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import FollowButton from "./FollowButton";

const PostCard = ({
  post,
  userId,
  onPostUpdate,
  following,
  onFollowChange,
  isLoading,
}) => {
  const [commentText, setCommentText] = useState("");
  const [editingText, setEditingText] = useState(post.text);
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const isFollowing =
    Array.isArray(following) && following.includes(post.user?._id);
  const isOwnPost = String(post.user?._id) === String(userId);
  const hasLiked = post.likes?.includes(userId);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onPostUpdate((prevPosts) =>
        prevPosts.map((p) => (p._id === post._id ? response.data : p))
      );
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comments`,
        { text: commentText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onPostUpdate((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, comments: data } : p))
      );
      setCommentText("");
      setShowComments(true);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const updatePost = async () => {
    if (!editingText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `http://localhost:5000/api/posts/${post._id}`,
        { text: editingText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onPostUpdate((prevPosts) =>
        prevPosts.map((p) => (p._id === post._id ? data : p))
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const deletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onPostUpdate((prevPosts) => prevPosts.filter((p) => p._id !== post._id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(
        `http://localhost:5000/api/posts/${post._id}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onPostUpdate((prev) =>
        prev.map((p) =>
          p._id === post._id ? { ...p, comments: data.comments } : p
        )
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div
      className={`bg-white h-full dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isFollowing
          ? "border-2 border-blue-500 dark:border-blue-400 relative"
          : "border border-gray-100 dark:border-gray-700"
      }`}
    >
      {/* "Following" indicator badge */}
      {/* {isFollowing && (
        <div className="absolute  right-4 bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center z-10 shadow-md animate-pulse-once">
          <span className="mr-1 text-blue-200">•</span>
          Following
        </div>
      )} */}

      {/* Post Header */}
      <div className="p-4 sm:p-6 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            {post.userimage ? (
              <img
                src={post.userimage || "/placeholder.svg"}
                alt={post.user?.name || "User"}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {post.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {post.user?.name || "Anonymous User"}
              </h3>
              <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-x-2">
                <span>{moment(post.createdAt).fromNow()}</span>
                <Globe size={14} className="text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>
          {/* Follow button for non-own posts */}
          {!isOwnPost && (
            <div className="mt-2 sm:mt-0">
              <FollowButton
                userId={userId}
                targetUserId={post.user?._id}
                isFollowing={isFollowing}
                onFollowChange={onFollowChange}
                disabled={isLoading}
              />
            </div>
          )}
          {isOwnPost && (
            <div className="relative">
              <button
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MoreHorizontal size={20} />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 z-20 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700 mt-2 py-1 min-w-[120px] animate-fade-in-down">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 w-full text-left text-gray-700 dark:text-gray-200 text-sm"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        deletePost();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 w-full text-left text-red-500 dark:text-red-400 text-sm"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4 sm:p-6 pt-3">
        {isEditing ? (
          <div className="flex flex-col gap-2 animate-fade-in">
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={updatePost}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
              >
                <Edit2 size={16} />
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm sm:text-base">
              {post.text}
            </p>
            {post.image && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt="Post"
                  className="w-full object-cover max-h-[400px] hover:opacity-95 transition-opacity cursor-pointer"
                  onClick={() => window.open(post.image, "_blank")}
                />
              </div>
            )}
          </>
        )}

        {/* Post Actions */}
        <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 text-sm ${
                hasLiked
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              } transition-colors ${isLiking ? "opacity-70" : ""}`}
            >
              <Heart
                size={18}
                className={`transition-transform ${
                  hasLiked ? "fill-current scale-110" : "scale-100"
                } ${isLiking ? "animate-pulse" : ""}`}
              />
              <span>{post.likes?.length || 0}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle size={18} />
              <span>{post.comments?.length || 0}</span>
              {post.comments?.length > 0 &&
                (showComments ? (
                  <ChevronUp size={16} className="ml-0.5" />
                ) : (
                  <ChevronDown size={16} className="ml-0.5" />
                ))}
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div
        className={`bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-all duration-300 overflow-hidden ${
          showComments || commentText ? "max-h-[1000px]" : "max-h-0 p-0"
        }`}
      >
        <div className="flex gap-3 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
            {userId && userId[0]?.toUpperCase()}
          </div>
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-200 text-sm"
              />
              {commentText && (
                <button
                  onClick={handleCommentSubmit}
                  disabled={isCommenting}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {isCommenting ? (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {post.comments?.length > 0 && showComments && (
          <div className="space-y-4 animate-fade-in">
            {post.comments.map((comment, index) => (
              <div
                key={comment._id}
                className="flex gap-3 items-start animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                  {comment.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-grow">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {comment.user?.name || "Anonymous User"}
                      </h4>
                      {String(comment.user._id) === String(userId) && (
                        <button
                          onClick={() => deleteComment(comment._id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs flex items-center gap-1 transition-colors"
                        >
                          <X size={14} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 text-sm break-words">
                      {comment.text}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                    {moment(comment.createdAt).fromNow()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
