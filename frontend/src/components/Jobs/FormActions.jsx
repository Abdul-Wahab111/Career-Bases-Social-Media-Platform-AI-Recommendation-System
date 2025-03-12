"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Loader } from "lucide-react"

const FormActions = ({ activeSection, setActiveSection, loading, isLastSection }) => {
  const sections = ["basic", "skills", "education", "courses", "interests"]
  const currentIndex = sections.indexOf(activeSection)

  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1])
    }
  }

  return (
    <div className="flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
      <motion.button
        type="button"
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          currentIndex === 0
            ? "opacity-0 pointer-events-none"
            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowLeft size={16} />
        <span>Previous</span>
      </motion.button>

      {isLastSection ? (
        <motion.button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium ${
            loading
              ? "bg-blue-400 dark:bg-blue-500/50 cursor-not-allowed"
              : "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
          } text-white`}
          whileHover={loading ? {} : { scale: 1.02 }}
          whileTap={loading ? {} : { scale: 0.98 }}
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <span>Post Job</span>
          )}
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </motion.button>
      )}
    </div>
  )
}

export default FormActions

