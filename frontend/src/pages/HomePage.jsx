import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { 
  Image as ImageIcon, 
  Heart, 
  MessageCircle, 
  Send, 
  Video, 
  FileText, 
  Globe 
} from "lucide-react";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const decoded = jwtDecode(token);
        const id = decoded._id || decoded.id;
        setUserId(id);
        fetchPosts(); // Fetch posts after setting user ID
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Token decode error:", error);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching posts with token:", token); // Enhanced logging

      const { data } = await axios.get("http://localhost:5000/api/posts/allposts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("API Response:", data); // Log the full response
      console.log("Posts count:", data.length); // Log number of posts
      console.log("Posts details:", JSON.stringify(data, null, 2)); // Detailed post logging

      // Additional checks
      if (!data || !Array.isArray(data)) {
        console.error("Unexpected data format:", data);
        setPosts([]);
        return;
      }

      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      console.error("Error details:", error.response?.data || error.message);
      setPosts([]); // Ensure posts is an empty array on error
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("text", text.trim());
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post("http://localhost:5000/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("New post created:", response.data);
      setPosts((prevPosts) => [response.data, ...prevPosts]);
      setText("");
      setImage(null);
    } catch (error) {
      console.error("Failed to create post:", error);
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Create Post Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {/* User Initial */}
            </div>
            <form onSubmit={handlePostSubmit} className="flex-grow">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full min-h-[100px] resize-none rounded-lg border border-gray-200 p-3 focus:ring-2 focus:ring-blue-500"
              />
              {previewUrl && (
                <div className="mt-4 relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 w-full object-cover rounded-lg" 
                  />
                  <button 
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-4">
                  <label className="cursor-pointer">
                    <ImageIcon className="text-green-500" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                    />
                  </label>
                  <Video className="text-blue-500" />
                  <FileText className="text-purple-500" />
                </div>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          {console.log("Rendering posts:", posts)} {/* Debug log */}
          {posts && posts.length > 0 ? (
            posts.map((post) => {
              console.log("Rendering individual post:", post); // Individual post log
              return (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  userId={userId} 
                  onPostUpdate={setPosts}
                />
              );
            })
          ) : (
            <div className="text-center text-gray-500">No posts available</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;