import React, { useState } from "react";
import axios from "axios";
import moment from "moment";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  Globe 
} from "lucide-react";



const PostCard = ({ post, userId, onPostUpdate }) => {
  const [commentText, setCommentText] = useState("");
  const [editingText, setEditingText] = useState(post.text);
  const [isEditing, setIsEditing] = useState(false);

  const handleLike = async () => {
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
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comments`,
        { text: commentText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onPostUpdate((prev) =>
        prev.map((p) =>
          p._id === post._id ? { ...p, comments: data } : p
        )
      );
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
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
      onPostUpdate((prevPosts) =>
        prevPosts.filter((p) => p._id !== post._id)
      );
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(
        `http://localhost:5000/api/posts/${post._id}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Post Header */}
      <div className="p-6 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {post.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {post.user?.name}
              </h3>
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <span>{moment(post.createdAt).fromNow()}</span>
                <Globe size={14} />
              </div>
            </div>
          </div>

          {String(post.user._id) === String(userId) && (
            <div className="dropdown relative">
              <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                <MoreHorizontal />
              </button>
              <div className="absolute right-0 z-10 hidden dropdown-content group-hover:block bg-white shadow-lg rounded-lg border mt-2">
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center gap-2 hover:bg-gray-100 p-2 w-full text-left"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={deletePost} 
                  className="flex items-center gap-2 hover:bg-gray-100 p-2 w-full text-left text-red-500"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="p-6 pt-3">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full rounded-lg border p-2"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={updatePost}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>
            {post.image && (
              <img
                src={`http://localhost:5000${post.image}`}
                alt="Post"
                className="mt-4 rounded-lg max-h-96 w-full object-cover"
              />
            )}
          </>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm ${
                post.likes?.includes(userId)
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              } transition-colors`}
            >
              <Heart
                size={20}
                className={
                  post.likes?.includes(userId) ? "fill-current" : ""
                }
              />
              {post.likes?.length || 0} Likes
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-500">
              <MessageCircle size={20} />
              {post.comments?.length || 0} Comments
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-50 p-6">
        <div className="flex gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
            {userId && userId[0]?.toUpperCase()}
          </div>
          <div className="flex-grow">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {commentText && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleCommentSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post
                </button>
              </div>
            )}
          </div>
        </div>

        {post.comments?.length > 0 && (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 items-start">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                  {comment.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-grow">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-sm text-gray-900">
                        {comment.user?.name}
                      </h4>
                      {String(comment.user._id) === String(userId) && (
                        <button 
                          onClick={() => deleteComment(comment._id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-800 text-sm">{comment.text}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
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