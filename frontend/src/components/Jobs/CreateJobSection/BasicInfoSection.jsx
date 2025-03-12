"use client"

import { motion } from "framer-motion"
import { Briefcase, Building, MapPin, DollarSign, FileText } from "lucide-react"

const BasicInfoSection = ({ formData, handleChange }) => {
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
      <motion.div variants={item}>
        <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
          Job Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Senior Frontend Developer"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
        />
      </motion.div>

      <motion.div variants={item}>
        <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <Building size={16} className="text-blue-600 dark:text-blue-400" />
          Company Name
        </label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="e.g. Acme Corporation"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
        />
      </motion.div>

      <motion.div variants={item}>
        <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <FileText size={16} className="text-blue-600 dark:text-blue-400" />
          Job Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the job responsibilities, requirements, and benefits..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px] resize-vertical"
          required
        />
      </motion.div>

      <motion.div variants={item}>
        <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
          Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. New York, NY or Remote"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
        />
      </motion.div>

      <motion.div variants={item}>
        <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <DollarSign size={16} className="text-blue-600 dark:text-blue-400" />
          Salary (Annual)
        </label>
        <input
          type="number"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          placeholder="e.g. 120000"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Leave blank if you prefer not to disclose</p>
      </motion.div>
    </motion.div>
  )
}

export default BasicInfoSection

