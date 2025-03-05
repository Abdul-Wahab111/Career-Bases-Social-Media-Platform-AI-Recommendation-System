import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { BookOpen, Briefcase, User2 } from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState({
    bio: "",
    skills: "",
    education: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [savedStatus, setSavedStatus] = useState("");

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
          bio: data.bio,
          skills: data.skills.join(", "),
          education: data.education,
        });
      } catch (error) {
        console.log("No profile found.");
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSavedStatus("");

    try {
      await axios.post(
        "http://localhost:5000/api/profiles",
        {
          bio: profile.bio,
          skills: profile.skills.split(",").map((skill) => skill.trim()),
          education: profile.education,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedStatus("success");
      setTimeout(() => {
        window.location.href = "/posts";
      }, 1500);
    } catch (error) {
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
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none"
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
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
                  : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
