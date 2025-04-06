"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import JobFormHeader from "./JobFormHeader"
import BasicInfoSection from "./CreateJobSection/BasicInfoSection"
import SkillsSection from "./CreateJobSection/SkillsSection"
import EducationSection from "./CreateJobSection/EducationSection"
import CoursesSection from "./CreateJobSection/CoursesSection"
import InterestsSection from "./CreateJobSection/InterestsSection"
import FormActions from "./FormActions"
import { toast } from "react-toastify"

const CreateJob = ({ fetchJobs }) => {
  // We'll get userId directly from the token instead of props
  const [userId, setUserId] = useState(null)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    skillsRequired: [],
    educationRequired: [{ degree: "", field: "" }],
    coursesPreferred: [{ courseName: "", provider: "" }],
    interests: [],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState("basic")

  // Get user ID from token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    try {
      if (token) {
        const decoded = jwtDecode(token)
        const id = decoded._id || decoded.id
        setUserId(id)
      }
    } catch (error) {
      console.error("Token decode error:", error)
      setError("Authentication error. Please log in again.")
    }
  }, [])

  // Handle input changes for regular fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  // Handle array input fields (comma-separated values)
  const handleArrayChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.target.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    })
    setError("")
  }

  // Handle nested objects (educationRequired & coursesPreferred)
  const handleNestedChange = (index, field, subField, value) => {
    const updatedArray = [...formData[field]]
    updatedArray[index][subField] = value
    setFormData({ ...formData, [field]: updatedArray })
    setError("")
  }

  // Add new education or course field dynamically
  const addField = (field, newItem) => {
    setFormData({ ...formData, [field]: [...formData[field], newItem] })
  }

  // Remove a field dynamically
  const removeField = (field, index) => {
    const updatedArray = [...formData[field]]
    updatedArray.splice(index, 1)
    setFormData({ ...formData, [field]: updatedArray })
  }

  // Validate form before submission
  const validateForm = () => {
    if (!userId) {
      setError("You must be logged in to post a job")
      return false
    }
    
    if (!formData.title.trim()) {
      setError("Job title is required")
      return false
    }
    if (!formData.company.trim()) {
      setError("Company name is required")
      return false
    }
    if (!formData.description.trim()) {
      setError("Job description is required")
      return false
    }
    if (!formData.location.trim()) {
      setError("Job location is required")
      return false
    }

    // Validate education fields
    const hasEmptyEducation = formData.educationRequired.some((edu) => !edu.degree.trim() || !edu.field.trim())
    if (hasEmptyEducation) {
      setError("Please complete all education fields or remove them")
      return false
    }

    return true
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      await axios.post(
        "http://localhost:5000/api/jobs",
        { ...formData, postedBy: userId },
        { headers: { Authorization: `Bearer ${token}` } }
        
      )
      // await axios.put(
      //   console.log("Match all jobs"),
      //   `http://localhost:5000/api/jobs/match-all`,
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      setSuccess(true)
      toast({
        title: "Success!",
        description: "Your job has been posted successfully.",
        variant: "success",
      })

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          company: "",
          location: "",
          salary: "",
          skillsRequired: [],
          educationRequired: [{ degree: "", field: "" }],
          coursesPreferred: [{ courseName: "", provider: "" }],
          interests: [],
        })
        setSuccess(false)
        if (fetchJobs) fetchJobs()
      }, 2000)
    } catch (error) {
      console.error("Error posting job:", error)
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        setError("Authentication failed. Please log in again.")
        localStorage.removeItem("token") // Clear invalid token
      } else {
        setError(error.response?.data?.message || "Failed to post job. Please try again.")
      }
      
      toast({
        title: "Error",
        description: error.response?.status === 401 
          ? "Authentication failed. Please log in again." 
          : "Failed to post job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <JobFormHeader activeSection={activeSection} setActiveSection={setActiveSection} />

      {error && (
        <motion.div
          className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          className="mx-6 mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <CheckCircle size={18} className="flex-shrink-0" />
          <span>Job posted successfully!</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className={activeSection === "basic" ? "block" : "hidden"}>
          <BasicInfoSection formData={formData} handleChange={handleChange} />
        </div>

        <div className={activeSection === "skills" ? "block" : "hidden"}>
          <SkillsSection formData={formData} handleArrayChange={handleArrayChange} />
        </div>

        <div className={activeSection === "education" ? "block" : "hidden"}>
          <EducationSection
            formData={formData}
            handleNestedChange={handleNestedChange}
            addField={addField}
            removeField={removeField}
          />
        </div>

        <div className={activeSection === "courses" ? "block" : "hidden"}>
          <CoursesSection
            formData={formData}
            handleNestedChange={handleNestedChange}
            addField={addField}
            removeField={removeField}
          />
        </div>

        <div className={activeSection === "interests" ? "block" : "hidden"}>
          <InterestsSection formData={formData} handleArrayChange={handleArrayChange} />
        </div>

        <FormActions
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          loading={loading}
          isLastSection={activeSection === "interests"}
        />
      </form>
    </motion.div>
  )
}

export default CreateJob