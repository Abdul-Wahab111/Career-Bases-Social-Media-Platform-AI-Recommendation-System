import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  BookOpen,
  Briefcase,
  User2,
  Layers,
  Heart,
  Image as ImageIcon,
  Award,
} from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState({
    bio: "",
    skills: "",
    education: "",
    courses: "",
    interests: "",
    achievements: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedStatus, setSavedStatus] = useState("");
  const [profileExists, setProfileExists] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/profiles/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfile({
          bio: data.bio || "",
          skills: data.skills?.join(", ") || "",
          education: data.education || "",
          courses: data.courses?.join(", ") || "",
          interests: data.interests?.join(", ") || "",
          achievements: data.achievements?.join(", ") || "",
          image: data.image || "",
        });

        setProfileExists(true); // Set profileExists to true if profile is found
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("No profile found. User can create a new profile.");
          setProfileExists(false); // Set profileExists to false if profile is not found
        } else {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, []);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        formData
      );
      return data.secure_url; // Returns the uploaded image URL
    } catch (error) {
      console.error("Image upload failed", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSavedStatus("");
  
    try {
      let imageUrl = profile.image; // Use existing image URL if no new file is selected
  
      // Upload new image if a file is selected
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
        if (!imageUrl) {
          throw new Error("Image upload failed");
        }
      }
  
      // Prepare profile data
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
        userimage: imageUrl || "", // Use the uploaded image URL or existing image URL
      };
  
      console.log(
        "Attempting to submit profile data:",
        JSON.stringify(profileData, null, 2)
      );
  
      // Determine if profile exists
      if (profileExists) {
        console.log("Profile exists, attempting to update...");
        const response = await axios.put(
          "http://localhost:5000/api/profiles/me",
          profileData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Profile updated successfully:", response.data);
        setSavedStatus("success");
      } else {
        console.log("No profile exists, attempting to create...");
        const response = await axios.post(
          "http://localhost:5000/api/profiles",
          profileData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Profile created successfully:", response.data);
        setSavedStatus("success");
        setProfileExists(true); // Set profileExists to true after creating the profile
      }
  
      // Update the profile state with the new image URL
      setProfile((prevProfile) => ({
        ...prevProfile,
        image: imageUrl,
      }));
    } catch (error) {
      console.error("Profile submission error:", error);
  
      // More detailed error logging
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
  
      setSavedStatus("error");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <h2 className="text-3xl font-bold text-white">
              Create Your Profile
            </h2>
            <p className="text-blue-100 mt-2">Tell us about yourself</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User2 size={18} />
                Bio
              </label>
              <textarea
                placeholder="Write a brief bio about yourself..."
                className="w-full p-3 border border-gray-200 rounded-lg min-h-[120px] resize-none"
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ImageIcon size={18} />
                Profile Image
              </label>
              <input
                type="file"
                className="w-full p-2 border border-gray-200 rounded-lg"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              {profile.image && (
                <img
                  src={profile.image}
                  alt="Profile"
                  className="w-24 h-24 mt-2 rounded-lg"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Briefcase size={18} />
                Skills
              </label>
              <input
                type="text"
                placeholder="e.g. JavaScript, React, Node.js"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={profile.skills}
                onChange={(e) =>
                  setProfile({ ...profile, skills: e.target.value })
                }
              />
              <p className="text-sm text-gray-500">
                Separate skills with commas
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <BookOpen size={18} />
                Education
              </label>
              <input
                type="text"
                placeholder="Your educational background"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={profile.education}
                onChange={(e) =>
                  setProfile({ ...profile, education: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Layers size={18} />
                Courses
              </label>
              <input
                type="text"
                placeholder="Courses you've completed"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={profile.courses}
                onChange={(e) =>
                  setProfile({ ...profile, courses: e.target.value })
                }
              />
              <p className="text-sm text-gray-500">
                Separate courses with commas
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Heart size={18} />
                Interests
              </label>
              <input
                type="text"
                placeholder="Your interests (e.g. AI, Web Development)"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={profile.interests}
                onChange={(e) =>
                  setProfile({ ...profile, interests: e.target.value })
                }
              />
              <p className="text-sm text-gray-500">
                Separate interests with commas
              </p>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Award size={18} />
                Achievements
              </label>
              <input
                type="text"
                placeholder="List your achievements"
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={profile.achievements}
                onChange={(e) =>
                  setProfile({ ...profile, achievements: e.target.value })
                }
              />
              <p className="text-sm text-gray-500">
                Separate achievements with commas
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
    ${
      isLoading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }
    ${savedStatus === "success" ? "bg-green-600" : ""}
    ${savedStatus === "error" ? "bg-red-600" : ""}`}
              >
                {isLoading
                  ? "Saving..."
                  : savedStatus === "success"
                  ? "Profile Saved!"
                  : savedStatus === "error"
                  ? "Error Saving Profile"
                  : profileExists
                  ? "Update Profile"
                  : "Create Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
