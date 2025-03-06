"use client"

import { useState } from "react"
import { User2, Mail, Calendar, UserPlus, UserMinus, Loader2, MessageCircle, Share2, Camera, Edit } from "lucide-react"
import { motion } from "framer-motion"

const ProfileHeader = ({
  user,
  profile,
  postsCount,
  followersCount,
  followingCount,
  isOwnProfile,
  isFollowing,
  isFollowLoading,
  handleFollow,
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false)

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${user.name}'s Profile`,
          text: `Check out ${user.name}'s profile!`,
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err))
    } else {
      setShowShareOptions(!showShareOptions)
    }
  }

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Profile link copied to clipboard!")
    setShowShareOptions(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      {/* Cover Photo */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 sm:h-48 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {isOwnProfile && (
          <button className="absolute bottom-2 right-2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all">
            <Camera size={18} />
          </button>
        )}
      </motion.div>

      <div className="px-4 sm:px-6 pb-6 relative">
        {/* Profile Image */}
        <div className="relative -mt-16 sm:-mt-24 mb-4 flex justify-between items-end">
          <motion.div
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-white dark:bg-gray-700 flex items-center justify-center relative group"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          >
            {profile?.userimage ? (
              <img
                src={profile.userimage || "/placeholder.svg"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User2 className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            )}

            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <a href="/profile" className="text-white hover:text-blue-200 transition-colors">
                  <Edit size={20} />
                </a>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          {!isOwnProfile ? (
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isFollowing
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } ${isFollowLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isFollowLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <UserMinus className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>{isFollowing ? "Unfollow" : "Follow"}</span>
              </button>

              <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                <MessageCircle className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {showShareOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700 animate-fade-in-down">
                    <div className="py-1">
                      <button
                        onClick={copyProfileLink}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Copy profile link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.a
              href="/profile"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Edit size={16} />
              Edit Profile
            </motion.a>
          )}
        </div>

        {/* User Info */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>

          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <Mail className="w-4 h-4 mr-1.5" />
            <span>{user.email}</span>
          </div>

          {user.createdAt && (
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>
                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          )}

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-3 gap-2 sm:gap-4 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, staggerChildren: 0.1 }}
          >
            <StatCard label="Posts" count={postsCount} />
            <StatCard label="Followers" count={followersCount} />
            <StatCard label="Following" count={followingCount} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

const StatCard = ({ label, count }) => (
  <motion.div
    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center hover:shadow-md transition-all duration-200 hover:scale-105"
    whileHover={{ y: -5 }}
  >
    <span className="block text-xl font-bold text-gray-900 dark:text-gray-100">{count}</span>
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
  </motion.div>
)

export default ProfileHeader

