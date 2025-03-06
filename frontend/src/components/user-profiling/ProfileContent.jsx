"use client"

import { motion, AnimatePresence } from "framer-motion"
import ProfileInfo from "./ProfileInfo"
import PostsList from "./PostsList"
import UsersList from "./UsersList"

const ProfileContent = ({ activeTab, profile, posts, followers, following, isOwnProfile, currentUser }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mt-2 p-4 sm:p-6 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "profile" && <ProfileInfo profile={profile} isOwnProfile={isOwnProfile} />}

          {activeTab === "posts" && <PostsList posts={posts} isOwnProfile={isOwnProfile} />}

          {activeTab === "followers" && (
            <UsersList
              users={followers}
              emptyMessage={
                isOwnProfile ? "You don't have any followers yet." : "This user doesn't have any followers yet."
              }
              currentUser={currentUser}
              listType="followers"
            />
          )}

          {activeTab === "following" && (
            <UsersList
              users={following}
              emptyMessage={isOwnProfile ? "You're not following anyone yet." : "This user isn't following anyone yet."}
              currentUser={currentUser}
              listType="following"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default ProfileContent

