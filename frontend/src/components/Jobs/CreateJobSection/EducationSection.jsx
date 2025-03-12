"use client"

import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, Plus, Trash2 } from "lucide-react"

const EducationSection = ({ formData, handleNestedChange, addField, removeField }) => {
  // Common degrees for suggestions
  const commonDegrees = ["Bachelor's", "Master's", "Ph.D.", "Associate's", "High School Diploma", "Certificate"]

  // Common fields for suggestions
  const commonFields = [
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Data Science",
    "Business Administration",
    "Marketing",
    "Finance",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Mathematics",
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
            <GraduationCap size={16} className="text-blue-600 dark:text-blue-400" />
            Education Requirements
          </label>

          <button
            type="button"
            onClick={() => addField("educationRequired", { degree: "", field: "" })}
            className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-1.5 text-sm transition-all"
          >
            <Plus size={14} />
            <span>Add Education</span>
          </button>
        </div>

        <AnimatePresence>
          {formData.educationRequired.map((edu, index) => (
            <motion.div
              key={index}
              className="flex flex-col sm:flex-row gap-3 mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 relative"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleNestedChange(index, "educationRequired", "degree", e.target.value)}
                  placeholder="e.g. Bachelor's"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />

                {/* Degree suggestions */}
                {!edu.degree && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {commonDegrees.slice(0, 3).map((degree) => (
                      <button
                        key={degree}
                        type="button"
                        onClick={() => handleNestedChange(index, "educationRequired", "degree", degree)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {degree}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => handleNestedChange(index, "educationRequired", "field", e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />

                {/* Field suggestions */}
                {!edu.field && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {commonFields.slice(0, 3).map((field) => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => handleNestedChange(index, "educationRequired", "field", field)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {formData.educationRequired.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField("educationRequired", index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  aria-label="Remove education"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default EducationSection

