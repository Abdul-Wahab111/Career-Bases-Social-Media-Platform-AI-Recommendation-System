"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import Layout from "../components/Layout"
import {
  BookOpen,
  Briefcase,
  User2,
  Layers,
  Heart,
  ImageIcon,
  Award,
  Upload,
  X,
  Check,
  AlertCircle,
  Loader2,
  Camera,
  Save,
  Edit2,
} from "lucide-react"

const Profile = () => {
  const [profile, setProfile] = useState({
    bio: "",
    skills: "",
    education: "",
    courses: "",
    interests: "",
    achievements: "",
    image: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedStatus, setSavedStatus] = useState("")
  const [profileExists, setProfileExists] = useState(false)
  const [activeSection, setActiveSection] = useState("basic")
  const [dragActive, setDragActive] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const fileInputRef = useRef(null)

  const token = localStorage.getItem("token")

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First get user info
        const userResponse = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (userResponse.data) {
          setUserName(userResponse.data.name || "")
          setUserEmail(userResponse.data.email || "")
        }

        // Then get profile info
        const profileResponse = await axios.get("http://localhost:5000/api/profiles/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const profileData = profileResponse.data

        setProfile({
          bio: profileData.bio || "",
          skills: profileData.skills?.join(", ") || "",
          education: profileData.education || "",
          courses: profileData.courses?.join(", ") || "",
          interests: profileData.interests?.join(", ") || "",
          achievements: profileData.achievements?.join(", ") || "",
          image: profileData.userimage || "",
        })

        setProfileExists(true)
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("No profile found. User can create a new profile.")
          setProfileExists(false)
        } else {
          console.error("Error fetching profile:", error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [token])

  // Handle image file selection
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(imageFile)
    } else {
      setImagePreview(null)
    }
  }, [imageFile])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        setImageFile(file)
      }
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

    try {
      const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
      )
      return data.secure_url
    } catch (error) {
      console.error("Image upload failed", error)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSavedStatus("")

    try {
      let imageUrl = profile.image

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile)
        if (!imageUrl) {
          throw new Error("Image upload failed")
        }
      }

      const profileData = {
        bio: profile.bio || "",
        skills: profile.skills
          ? profile.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [],
        education: profile.education || "",
        courses: profile.courses
          ? profile.courses
              .split(",")
              .map((course) => course.trim())
              .filter(Boolean)
          : [],
        interests: profile.interests
          ? profile.interests
              .split(",")
              .map((interest) => interest.trim())
              .filter(Boolean)
          : [],
        achievements: profile.achievements
          ? profile.achievements
              .split(",")
              .map((achievement) => achievement.trim())
              .filter(Boolean)
          : [],
        userimage: imageUrl || "",
      }

      if (profileExists) {
        await axios.put("http://localhost:5000/api/profiles/me", profileData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.post("http://localhost:5000/api/profiles", profileData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setProfileExists(true)
      }

      setProfile((prevProfile) => ({
        ...prevProfile,
        image: imageUrl,
      }))

      setSavedStatus("success")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSavedStatus("")
      }, 3000)
    } catch (error) {
      console.error("Profile submission error:", error)
      setSavedStatus("error")

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSavedStatus("")
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Profile Image */}
              <div className="relative group">
                <div
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-white dark:bg-gray-700 flex items-center justify-center ${imagePreview || profile.image ? "" : "bg-gray-100 dark:bg-gray-600"}`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : profile.image ? (
                    <img
                      src={profile.image || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User2 className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-all duration-200 transform group-hover:scale-110"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {profileExists ? "Edit Your Profile" : "Create Your Profile"}
                </h2>
                <div className="text-blue-100 mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <p className="font-medium">{userName}</p>
                  {userEmail && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <p className="text-sm opacity-80">{userEmail}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex mt-6 border-b border-blue-500/30">
              <button
                type="button"
                onClick={() => setActiveSection("basic")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeSection === "basic" ? "text-white border-b-2 border-white" : "text-blue-100 hover:text-white"
                }`}
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("education")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeSection === "education"
                    ? "text-white border-b-2 border-white"
                    : "text-blue-100 hover:text-white"
                }`}
              >
                Education
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("skills")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeSection === "skills" ? "text-white border-b-2 border-white" : "text-blue-100 hover:text-white"
                }`}
              >
                Skills & Interests
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {savedStatus && (
            <div
              className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 text-sm animate-fade-in ${
                savedStatus === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-100 dark:border-green-800/30"
                  : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-800/30"
              }`}
            >
              {savedStatus === "success" ? (
                <Check className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
              )}
              <span>
                {savedStatus === "success"
                  ? "Your profile has been saved successfully!"
                  : "There was an error saving your profile. Please try again."}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Hidden file input */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            {/* Basic Info Section */}
            <div className={activeSection === "basic" ? "block" : "hidden"}>
              {/* Bio */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <User2 size={18} />
                  Bio
                </label>
                <textarea
                  placeholder="Write a brief bio about yourself..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[120px] resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>

              {/* Profile Image Upload */}
              <div className="space-y-2 mt-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <ImageIcon size={18} />
                  Profile Image
                </label>

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
                  {imagePreview ? (
                    <div className="relative mx-auto w-40 h-40">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
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
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG or GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Education Section */}
            <div className={activeSection === "education" ? "block" : "hidden"}>
              <div className="space-y-6">
                {/* Education */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <BookOpen size={18} />
                    Education
                  </label>
                  <input
                    type="text"
                    placeholder="Your educational background (e.g. Bachelor's in Computer Science)"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-all"
                    value={profile.education}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  />
                </div>

                {/* Courses */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Layers size={18} />
                    Courses
                  </label>
                  <textarea
                    placeholder="Courses you've completed (e.g. Advanced JavaScript, Machine Learning Basics)"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-all min-h-[100px] resize-none"
                    value={profile.courses}
                    onChange={(e) => setProfile({ ...profile, courses: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500">Separate courses with commas</p>
                </div>

                {/* Achievements */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Award size={18} />
                    Achievements
                  </label>
                  <textarea
                    placeholder="List your achievements (e.g. Dean's List, Hackathon Winner)"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-all min-h-[100px] resize-none"
                    value={profile.achievements}
                    onChange={(e) => setProfile({ ...profile, achievements: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500">Separate achievements with commas</p>
                </div>
              </div>
            </div>

            {/* Skills & Interests Section */}
            <div className={activeSection === "skills" ? "block" : "hidden"}>
              <div className="space-y-6">
                {/* Skills */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Briefcase size={18} />
                    Skills
                  </label>
                  <textarea
                    placeholder="Your technical and professional skills (e.g. JavaScript, React, Node.js, Project Management)"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-all min-h-[100px] resize-none"
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500">Separate skills with commas</p>
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Heart size={18} />
                    Interests
                  </label>
                  <textarea
                    placeholder="Your interests and hobbies (e.g. AI, Web Development, Photography, Hiking)"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-all min-h-[100px] resize-none"
                    value={profile.interests}
                    onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500">Separate interests with commas</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`py-2.5 px-6 rounded-lg text-white font-medium transition-all flex items-center gap-2 ${
                  isSaving
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : profileExists ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    <span>Create Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Profile Preview</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This is how your profile will appear to others</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Image */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                {imagePreview ? (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : profile.image ? (
                  <img src={profile.image || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User2 className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{userName || "Your Name"}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{userEmail || "your.email@example.com"}</p>

                <div className="mt-3">
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                    {profile.bio || "Your bio will appear here..."}
                  </p>
                </div>

                {/* Skills Tags */}
                {profile.skills && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.split(",").map(
                        (skill, index) =>
                          skill.trim() && (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                            >
                              {skill.trim()}
                            </span>
                          ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              {(profile.education || profile.courses) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                    Education & Courses
                  </h3>

                  {profile.education && (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Education:</span> {profile.education}
                    </div>
                  )}

                  {profile.courses && (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Courses:</span> {profile.courses}
                    </div>
                  )}
                </div>
              )}

              {/* Interests & Achievements */}
              {(profile.interests || profile.achievements) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Heart size={16} className="text-blue-600 dark:text-blue-400" />
                    Interests & Achievements
                  </h3>

                  {profile.interests && (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Interests:</span> {profile.interests}
                    </div>
                  )}

                  {profile.achievements && (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Achievements:</span> {profile.achievements}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Profile

