"use client"

import { motion } from "framer-motion"
import { User2, FileText, Users, UserCheck } from "lucide-react"

const ProfileTabs = ({ activeTab, setActiveTab, isOwnProfile }) => {
  const tabs = [
    { id: "profile", label: "Profile", icon: User2 },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "followers", label: "Followers", icon: Users },
    { id: "following", label: "Following", icon: UserCheck },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mt-6 overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 flex-1 justify-center whitespace-nowrap ${
              activeTab === tab.id
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>

            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                layoutId="activeTab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProfileTabs

