import { useState } from "react";
import axios from "axios";
import { Heart, MessageCircle, Edit2, Trash2, Send } from "lucide-react";
import moment from "moment";

const PostList = ({ posts, userId, fetchPosts }) => {
  const [commentMap, setCommentMap] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [updatedText, setUpdatedText] = useState("");

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchPosts();
    } catch (error) {
      console.error("Error liking post:", error.response?.data?.message);
      alert("Failed to like post. Please try again.");
    }
  };

  const updatePost = async (postId, newText) => {
    if (!newText.trim()) {
      alert("Post text cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `http://localhost:5000/api/posts/${postId}`,
        { text: newText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
      setEditingPostId(null);
      setUpdatedText("");
    } catch (error) {
      console.error("Error updating post:", error.response?.data?.message);
      alert("Failed to update post. Please try again.");
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchPosts();
      } catch (error) {
        console.error("Error deleting post:", error.response?.data?.message);
        alert("Failed to delete post. Please try again.");
      }
    }
  };

  const handleCommentSubmit = async (postId, text) => {
    if (!text?.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { text: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
      setCommentMap((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error.response?.data?.message);
      alert("Failed to add comment. Please try again.");
    }
  };

  const deleteComment = async (postId, commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.delete(
          `http://localhost:5000/api/posts/${postId}/comments/${commentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchPosts();
      } catch (error) {
        console.error("Error deleting comment:", error.response?.data?.message);
        alert("Failed to delete comment. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={post.userimage}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {post.user?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {moment(post.createdAt).fromNow()}
                  </p>
                </div>
              </div>

              {String(post.user?._id) === String(userId) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPostId(post._id);
                      setUpdatedText(post.text);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deletePost(post._id)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {editingPostId === post._id ? (
              <div className="mt-4">
                <textarea
                  value={updatedText}
                  onChange={(e) => setUpdatedText(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => updatePost(post._id, updatedText)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingPostId(null);
                      setUpdatedText("");
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>
            )}

            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="mt-4 rounded-lg max-h-96 w-full object-cover"
              />
            )}

            <div className="flex items-center gap-6 mt-4 pt-4 border-t">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center gap-2 text-sm ${
                  post.likes?.includes(userId)
                    ? "text-red-500"
                    : "text-gray-500 hover:text-red-500"
                } transition-colors`}
              >
                <Heart
                  size={18}
                  className={
                    post.likes?.includes(userId) ? "fill-current" : ""
                  }
                />
                {post.likes?.length || 0}
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-500">
                <MessageCircle size={18} />
                {post.comments?.length || 0}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={commentMap[post._id] || ""}
                onChange={(e) =>
                  setCommentMap((prev) => ({
                    ...prev,
                    [post._id]: e.target.value,
                  }))
                }
                placeholder="Write a comment..."
                className="flex-grow px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() =>
                  handleCommentSubmit(post._id, commentMap[post._id])
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                    {comment.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-semibold text-sm text-gray-900">
                        {comment.user?.name}
                      </p>
                      <p className="text-gray-800">{comment.text}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{moment(comment.createdAt).fromNow()}</span>
                      {String(comment.user?._id) === String(userId) && (
                        <button
                          onClick={() => deleteComment(post._id, comment._id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;