"use client"

import { motion } from "framer-motion"
import { Briefcase, Book, GraduationCap, Heart, Code } from "lucide-react"

const JobFormHeader = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: "basic", label: "Basic Info", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Code },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "courses", label: "Courses", icon: Book },
    { id: "interests", label: "Interests", icon: Heart },
  ]

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
      <h2 className="text-xl font-bold text-white mb-6">Post a New Job</h2>

      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-1 sm:space-x-2 min-w-full">
          {sections.map((section, index) => {
            const isActive = activeSection === section.id
            const isPast = sections.findIndex((s) => s.id === activeSection) > index

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white text-blue-700"
                    : isPast
                      ? "bg-blue-500/30 text-white"
                      : "text-blue-100 hover:bg-blue-500/20"
                }`}
              >
                <section.icon size={16} className="mr-1.5" />
                <span>{section.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-white rounded-lg"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-blue-500/30 h-1.5 mt-4 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white"
          initial={{ width: "20%" }}
          animate={{
            width: `${(sections.findIndex((s) => s.id === activeSection) + 1) * 20}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

export default JobFormHeader

