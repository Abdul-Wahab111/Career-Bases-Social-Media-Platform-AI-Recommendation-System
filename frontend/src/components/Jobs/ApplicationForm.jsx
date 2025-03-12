import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const ApplicationForm = ({ jobId, onApplicationSuccess }) => {
  const [resume, setResume] = useState(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Get authentication token
  const getAuthToken = () => localStorage.getItem("token")

  // Handle resume file selection
  const handleResumeChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const allowedFormats = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
      if (!allowedFormats.includes(file.type)) {
        toast.error("Only DOC and DOCX files are allowed. PDFs and other formats are not supported.")
        e.target.value = "" // Reset input field
        return
      }
      setResume(file)
    }
  }

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          },
        },
      )

      return response.data.secure_url
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload resume. Please try again.")
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  // Handle job application submission
  const handleApply = async (e) => {
    e.preventDefault()

    if (!resume) {
      toast.error("Please upload your resume (DOC or DOCX only).")
      return
    }

    try {
      setIsApplying(true)

      // Upload resume to Cloudinary
      const resumeUrl = await uploadToCloudinary(resume)

      // Get the auth token
      const token = getAuthToken()
      if (!token) {
        toast.error("Please log in to apply for this job")
        return
      }

      // Submit application
      await axios.post(
        `http://localhost:5000/api/jobs/${jobId}/apply`,
        { resume: resumeUrl, coverLetter },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      toast.success("Application submitted successfully!")
      setResume(null)
      setCoverLetter("")

      // Notify parent component
      if (onApplicationSuccess) onApplicationSuccess()

      // Reset file input
      const fileInput = document.getElementById("resume-upload")
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Error applying for job:", error)
      if (error.response?.status === 400 && error.response.data.message === "User has already applied") {
        toast.error("You have already applied for this position")
      } else {
        toast.error(error.response?.data?.message || "Failed to submit application. Please try again.")
      }
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <>
      <h3 className="text-xl font-bold mb-4">Apply for this position</h3>
      <form onSubmit={handleApply} className="space-y-4">
        {/* Resume Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Resume (DOC, DOCX only)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors hover:border-indigo-400 focus-within:border-indigo-400">
            <input
              id="resume-upload"
              type="file"
              accept=".doc,.docx"
              onChange={handleResumeChange}
              className="hidden"
              required
            />
            <label htmlFor="resume-upload" className="flex flex-col items-center justify-center cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-indigo-600 font-medium">
                {resume ? resume.name : "Click to upload your resume"}
              </span>
              <span className="text-sm text-gray-500 mt-1">
                {!resume && "Only DOC and DOCX files allowed. PDFs are not supported."}
              </span>
            </label>
          </div>
          {isUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Uploading: {uploadProgress}%</p>
            </div>
          )}
        </div>

        {/* Cover Letter */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Cover Letter</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="Why are you a good fit for this role?"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isApplying || isUploading}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
            isApplying || isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
          }`}
        >
          {isApplying ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </>
  )
}

export default ApplicationForm
