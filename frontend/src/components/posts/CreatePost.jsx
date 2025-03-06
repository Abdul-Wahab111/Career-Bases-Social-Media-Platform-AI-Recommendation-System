"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Image,
  Send,
  X,
  Loader2,
  Smile,
  Link,
  MapPin,
  Camera,
} from "lucide-react";

const CreatePost = ({ userId, fetchPosts }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const MAX_CHARS = 500;
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const formRef = useRef(null);

  // Focus textarea when component mounts
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  // Handle character count
  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  // Handle click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest(".emoji-picker-container")) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      if (!file.type.match("image.*")) {
        setError("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        formData
      );
      return response.data.secure_url; // Return the uploaded image URL
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      setError("Failed to upload image. Please try again.");
      return null;
    }
  };

  // Add emoji to text
  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current.focus();
  };

  // Reset form
  const resetForm = () => {
    setText("");
    setImage(null);
    setPreviewUrl(null);
    setError("");
    setIsExpanded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter text for your post");
      return;
    }

    if (text.length > MAX_CHARS) {
      setError(`Post text cannot exceed ${MAX_CHARS} characters`);
      return;
    }

    setIsSubmitting(true);
    setError("");

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
      setSuccess(true);

      // Show success message briefly before resetting
      setTimeout(() => {
        resetForm();
        setSuccess(false);
        fetchPosts();
      }, 1500);
    } catch (error) {
      console.error("Failed to create post:", error.response?.data?.message);
      setError(
        error.response?.data?.message ||
          "Failed to create post. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle textarea focus
  const handleTextareaFocus = () => {
    setIsExpanded(true);
  };

  // Handle camera click for mobile
  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  // Common emojis
  const commonEmojis = [
    "😊",
    "👍",
    "❤️",
    "🎉",
    "🔥",
    "😂",
    "🙌",
    "🤔",
    "👏",
    "✨",
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300 ${
        isExpanded ? "p-6" : "p-4"
      }`}
    >
      <form
        ref={formRef}
        onSubmit={handlePostSubmit}
        className="space-y-4"
        onDragEnter={handleDrag}
      >
        {/* Post Input Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            className={`w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-all duration-300 ${
              dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
            } ${isExpanded ? "min-h-[120px]" : "min-h-[60px]"}`}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={handleTextareaFocus}
            maxLength={MAX_CHARS + 10} // Allow slightly more than max to show error
          />

          {/* Character Counter */}
          <div
            className={`absolute bottom-2 right-2 text-xs ${
              charCount > MAX_CHARS
                ? "text-red-500 dark:text-red-400"
                : charCount > MAX_CHARS * 0.8
                ? "text-amber-500 dark:text-amber-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {charCount}/{MAX_CHARS}
          </div>
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="relative mt-2 group animate-fade-in">
            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
                className="max-h-64 w-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setPreviewUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="absolute top-2 right-2 p-1.5 bg-gray-800/70 text-white rounded-full hover:bg-red-600 transition-colors group-hover:scale-110 transform duration-200"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Drag & Drop Zone */}
        {isExpanded && !previewUrl && (
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-700"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center py-2">
              <Image className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop an image, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                PNG, JPG or GIF up to 5MB
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 dark:text-red-400 text-sm flex items-center gap-1.5 animate-fade-in">
            <X size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="text-green-500 dark:text-green-400 text-sm flex items-center gap-1.5 animate-fade-in">
            <div className="flex-shrink-0 w-4 h-4">✓</div>
            Post created successfully!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Image Upload Button */}
            <label className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors">
              <Image size={18} />
              <span className="hidden sm:inline text-sm">Photo</span>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>

            {/* Mobile Camera Button */}
            <button
              type="button"
              className="sm:hidden flex items-center gap-1 px-2 py-1.5 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              onClick={handleCameraClick}
            >
              <Camera size={18} />
            </button>

            {/* Emoji Picker */}
            <div className="relative emoji-picker-container">
              <button
                type="button"
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={18} />
                <span className="hidden sm:inline text-sm">Emoji</span>
              </button>

              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-10 animate-fade-in-down min-w-max w-64 sm:w-80 md:w-96">
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        className="text-xl w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => addEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-2 ml-auto">
            {isExpanded && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            )}

            <button
              className={`px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 text-sm font-medium flex items-center gap-2 ${
                isSubmitting || !text.trim() || text.length > MAX_CHARS
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
              }`}
              type="submit"
              disabled={isSubmitting || !text.trim() || text.length > MAX_CHARS}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
