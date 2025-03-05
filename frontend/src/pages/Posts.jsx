import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { Image, Heart, MessageCircle, Edit2, Trash2, Send } from "lucide-react";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [commentMap, setCommentMap] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [updatedText, setUpdatedText] = useState("");
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const decoded = jwtDecode(token);
        const id = decoded._id || decoded.id;
        setUserId(id);
      }
    } catch (error) {
      console.error("Token decode error:", error);
    }
  }, []);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && userId) {
      fetchPosts();
    }
  }, [userId]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("Please enter text for the post");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("text", text.trim());
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Created post:", response.data);
      setPosts((prevPosts) => [response.data, ...prevPosts]);
      setText("");
      setImage(null);
      if (document.querySelector('input[type="file"]')) {
        document.querySelector('input[type="file"]').value = "";
      }
    } catch (error) {
      console.error("Failed to create post:", error.response?.data?.message);
      alert("Failed to create post. Please try again.");
    }
  };

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
      setPosts(
        posts.map((post) => (post._id === postId ? response.data : post))
      );
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
      console.log("Updated post:", data);
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? data : post))
      );
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
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
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
      console.log("Added comment:", data);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, comments: data } : post
        )
      );
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
        console.log("Deleted comment response:", data);
        setPosts(
          posts.map((post) => {
            if (post._id === postId) {
              return { ...post, comments: data.comments };
            }
            return post;
          })
        );
      } catch (error) {
        console.error("Error deleting comment:", error.response?.data?.message);
        alert("Failed to delete comment. Please try again.");
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Create Post Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="What's on your mind?"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {/* Image Preview */}
              {previewUrl && (
                <div className="relative mt-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                <Image size={20} />
                <span>Add Photo</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files[0])}
                  accept="image/*"
                />
              </label>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                type="submit"
                disabled={isSubmitting || !text.trim()}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Post Header */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {post.user?.name?.[0]?.toUpperCase()}
                    </div>
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

                {/* Post Content */}
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
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {post.text}
                  </p>
                )}

                {post.image && (
                  <img
                    src={`http://localhost:5000${post.image}`}
                    alt="Post"
                    className="mt-4 rounded-lg max-h-96 w-full object-cover"
                  />
                )}

                {/* Post Actions */}
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

              {/* Comments Section */}
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
                              onClick={() =>
                                deleteComment(post._id, comment._id)
                              }
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
      </div>
    </Layout>
  );
};

export default Posts;
