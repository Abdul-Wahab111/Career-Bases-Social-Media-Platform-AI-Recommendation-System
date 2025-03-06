import { useState } from "react";
import axios from "axios";
import { Image, Trash2, Send } from "lucide-react";

const CreatePost = ({ userId, fetchPosts }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url; // Return the uploaded image URL
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      alert("Failed to upload image. Try again.");
      return null;
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("Please enter text for the post");
      return;
    }

    setIsSubmitting(true);

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImageToCloudinary(image);
      if (!imageUrl) {
        setIsSubmitting(false);
        return;
      }
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/posts",
        { text: text.trim(), image: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Created post:", response.data);
      setText("");
      setImage(null);
      setPreviewUrl(null);
      fetchPosts();
    } catch (error) {
      console.error("Failed to create post:", error.response?.data?.message);
      alert("Failed to create post. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <form onSubmit={handlePostSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
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
              onChange={handleImageChange}
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
  );
};

export default CreatePost;
