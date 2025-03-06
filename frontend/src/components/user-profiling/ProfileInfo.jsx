"use client"

import { User2, Briefcase, BookOpen, Heart, Award } from "lucide-react"
import { motion } from "framer-motion"

const ProfileInfo = ({ profile, isOwnProfile }) => {
  if (!profile) {
    return (
      <div className="py-8 text-center">
        <User2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          {isOwnProfile
            ? "You haven't created a profile yet. Create one to share more about yourself!"
            : "This user hasn't created a profile yet."}
        </p>
        {isOwnProfile && (
          <a
            href="/profile"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Profile
          </a>
        )}
      </div>
    )
  }

  const sections = [
    {
      id: "bio",
      title: "About",
      icon: User2,
      content: profile.bio,
      type: "text",
    },
    {
      id: "skills",
      title: "Skills",
      icon: Briefcase,
      content: profile.skills,
      type: "tags",
    },
    {
      id: "education",
      title: "Education",
      icon: BookOpen,
      content: profile.education,
      type: "text",
    },
    {
      id: "interests",
      title: "Interests",
      icon: Heart,
      content: profile.interests,
      type: "list",
    },
    {
      id: "achievements",
      title: "Achievements",
      icon: Award,
      content: profile.achievements,
      type: "list",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {sections.map((section) => {
        // Skip sections with no content
        if (!section.content || (Array.isArray(section.content) && section.content.length === 0)) {
          return null
        }

        return (
          <motion.div key={section.id} className="space-y-2" variants={item}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <section.icon size={16} className="text-blue-600 dark:text-blue-400" />
              {section.title}
            </h3>

            {section.type === "text" && (
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{section.content}</p>
            )}

            {section.type === "tags" && Array.isArray(section.content) && (
              <div className="flex flex-wrap gap-2">
                {section.content.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {section.type === "list" && Array.isArray(section.content) && (
              <p className="text-gray-700 dark:text-gray-300 text-sm">{section.content.join(", ")}</p>
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export default ProfileInfo

