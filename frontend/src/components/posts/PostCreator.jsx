import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Video, FileText } from "lucide-react";
import axios from "axios";

const PostCreator = ({ onPostCreated, isLoading, setIsLoading }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      return;
    }

    setIsLoading(true);
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
      
      // Call the callback to update posts in parent component
      if (onPostCreated) {
        onPostCreated(response.data);
      }
      
      // Reset form state
      setText("");
      setImage(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Failed to create post:", error);
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
          {/* User Initial will be here */}
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
                onClick={() => {
                  setImage(null);
                  setPreviewUrl(null);
                }}
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
              disabled={isLoading || !text.trim()}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
                isLoading || !text.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreator;