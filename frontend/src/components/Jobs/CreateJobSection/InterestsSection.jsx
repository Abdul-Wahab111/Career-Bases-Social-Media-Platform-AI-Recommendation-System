"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, Plus, X } from "lucide-react"

const InterestsSection = ({ formData, handleArrayChange }) => {
  const [interestInput, setInterestInput] = useState("")

  // Common interests for suggestions
  const commonInterests = [
    "Open Source",
    "AI/Machine Learning",
    "Web Development",
    "Mobile Development",
    "Cloud Computing",
    "DevOps",
    "Cybersecurity",
    "Blockchain",
    "Data Science",
    "UI/UX Design",
    "Game Development",
    "IoT",
    "Robotics",
    "Agile Methodologies",
  ]

  const addInterest = (interest) => {
    if (interest && !formData.interests.includes(interest)) {
      const updatedInterests = [...formData.interests, interest]
      handleArrayChange({ target: { value: updatedInterests.join(", ") } }, "interests")
      setInterestInput("")
    }
  }

  const removeInterest = (interestToRemove) => {
    const updatedInterests = formData.interests.filter((interest) => interest !== interestToRemove)
    handleArrayChange({ target: { value: updatedInterests.join(", ") } }, "interests")
  }

  const handleInterestInputChange = (e) => {
    setInterestInput(e.target.value)
  }

  const handleInterestInputKeyDown = (e) => {
    if (e.key === "Enter" && interestInput.trim()) {
      e.preventDefault()
      addInterest(interestInput.trim())
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <Heart size={16} className="text-blue-600 dark:text-blue-400" />
          Relevant Interests
        </label>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Add interests that would be beneficial for candidates in this role (optional)
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={interestInput}
            onChange={handleInterestInputChange}
            onKeyDown={handleInterestInputKeyDown}
            placeholder="Add an interest..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => addInterest(interestInput.trim())}
            disabled={!interestInput.trim()}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>

        {/* Selected interests */}
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.interests.map((interest, index) => (
            <motion.span
              key={interest}
              className="px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 rounded-full flex items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-200 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.span>
          ))}
        </div>

        {/* Interest suggestions */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Suggested interests:</p>
          <div className="flex flex-wrap gap-2">
            {commonInterests
              .filter((interest) => !formData.interests.includes(interest))
              .slice(0, 8)
              .map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => addInterest(interest)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {interest}
                </button>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default InterestsSection

