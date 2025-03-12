"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Code, Plus, X } from "lucide-react"

const SkillsSection = ({ formData, handleArrayChange }) => {
  const [skillInput, setSkillInput] = useState("")

  // Common tech skills for suggestions
  const commonSkills = [
    "JavaScript",
    "React",
    "Node.js",
    "TypeScript",
    "Python",
    "Java",
    "SQL",
    "AWS",
    "Docker",
    "Git",
    "HTML/CSS",
    "Angular",
    "Vue.js",
    "PHP",
    "Ruby",
    "C#",
    ".NET",
    "MongoDB",
  ]

  const addSkill = (skill) => {
    if (skill && !formData.skillsRequired.includes(skill)) {
      const updatedSkills = [...formData.skillsRequired, skill]
      handleArrayChange({ target: { value: updatedSkills.join(", ") } }, "skillsRequired")
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove) => {
    const updatedSkills = formData.skillsRequired.filter((skill) => skill !== skillToRemove)
    handleArrayChange({ target: { value: updatedSkills.join(", ") } }, "skillsRequired")
  }

  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value)
  }

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault()
      addSkill(skillInput.trim())
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
        <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <Code size={16} className="text-blue-600 dark:text-blue-400" />
          Required Skills
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={handleSkillInputChange}
            onKeyDown={handleSkillInputKeyDown}
            placeholder="Add a skill..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => addSkill(skillInput.trim())}
            disabled={!skillInput.trim()}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>

        {/* Selected skills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.skillsRequired.map((skill, index) => (
            <motion.span
              key={skill}
              className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full flex items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.span>
          ))}
        </div>

        {/* Skill suggestions */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Suggested skills:</p>
          <div className="flex flex-wrap gap-2">
            {commonSkills
              .filter((skill) => !formData.skillsRequired.includes(skill))
              .slice(0, 10)
              .map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {skill}
                </button>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SkillsSection

