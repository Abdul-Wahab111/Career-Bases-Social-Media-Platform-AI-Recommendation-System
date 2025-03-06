"use client"

import { useState } from "react"
import { User2, UserPlus, UserMinus, Loader2, Search } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"

const UsersList = ({ users, emptyMessage, currentUser, listType }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [followLoading, setFollowLoading] = useState({})

  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : users

  const handleFollowAction = async (targetUserId, isCurrentlyFollowing) => {
    if (followLoading[targetUserId]) return

    setFollowLoading((prev) => ({ ...prev, [targetUserId]: true }))

    try {
      const token = localStorage.getItem("token")
      const endpoint = isCurrentlyFollowing ? "unfollow" : "follow"

      await axios.post(
        `http://localhost:5000/api/users/${endpoint}/${targetUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      // We would ideally refresh the data here, but for now we'll just update the UI
      // This would be better handled through a context or state management library
    } catch (error) {
      console.error(`Error ${isCurrentlyFollowing ? "unfollowing" : "following"} user:`, error)
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetUserId]: false }))
    }
  }

  if (users.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <User2 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No users found</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-200 text-sm"
        />
      </div>

      {/* Users List */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <UserCard
              key={user._id}
              user={user}
              index={index}
              currentUser={currentUser}
              handleFollowAction={handleFollowAction}
              isFollowing={currentUser?.following?.includes(user._id)}
              isLoading={followLoading[user._id] || false}
            />
          ))
        ) : (
          <div className="col-span-2 py-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No users found matching "{searchTerm}"</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

const UserCard = ({ user, index, currentUser, handleFollowAction, isFollowing, isLoading }) => {
  const isCurrentUser = user._id === currentUser?._id

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          {user.profile?.userimage ? (
            <img
              src={user.profile.userimage || "/placeholder.svg"}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User2 className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <a
            href={`/profile/${user._id}`}
            className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {user.name}
          </a>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
        </div>

        {!isCurrentUser && (
          <button
            onClick={() => handleFollowAction(user._id, isFollowing)}
            disabled={isLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isFollowing
                ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isFollowing ? (
              <UserMinus className="w-3 h-3" />
            ) : (
              <UserPlus className="w-3 h-3" />
            )}
            <span>{isFollowing ? "Unfollow" : "Follow"}</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default UsersList

