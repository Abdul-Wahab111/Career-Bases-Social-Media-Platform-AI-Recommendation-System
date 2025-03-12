"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Book, Plus, Trash2 } from "lucide-react"

const CoursesSection = ({ formData, handleNestedChange, addField, removeField }) => {
  // Common course providers for suggestions
  const commonProviders = [
    "Coursera",
    "Udemy",
    "edX",
    "LinkedIn Learning",
    "Pluralsight",
    "Codecademy",
    "Khan Academy",
    "FreeCodeCamp",
  ]

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Book size={16} className="text-blue-600 dark:text-blue-400" />
            Preferred Courses
          </label>

          <button
            type="button"
            onClick={() => addField("coursesPreferred", { courseName: "", provider: "" })}
            className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-1.5 text-sm transition-all"
          >
            <Plus size={14} />
            <span>Add Course</span>
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          List any specific courses that would be beneficial for this role (optional)
        </p>

        <AnimatePresence>
          {formData.coursesPreferred.map((course, index) => (
            <motion.div
              key={index}
              className="flex flex-col sm:flex-row gap-3 mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 relative"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Course Name</label>
                <input
                  type="text"
                  value={course.courseName}
                  onChange={(e) => handleNestedChange(index, "coursesPreferred", "courseName", e.target.value)}
                  placeholder="e.g. Advanced React Development"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Provider (Optional)
                </label>
                <input
                  type="text"
                  value={course.provider}
                  onChange={(e) => handleNestedChange(index, "coursesPreferred", "provider", e.target.value)}
                  placeholder="e.g. Coursera"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                {/* Provider suggestions */}
                {!course.provider && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {commonProviders.slice(0, 3).map((provider) => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => handleNestedChange(index, "coursesPreferred", "provider", provider)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {provider}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeField("coursesPreferred", index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                aria-label="Remove course"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default CoursesSection

