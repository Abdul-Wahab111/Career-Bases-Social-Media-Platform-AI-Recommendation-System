import { useState, useEffect } from "react";

const JobList = ({ jobs, fetchJobs }) => {
  const [editingJob, setEditingJob] = useState(null);
  const [updatedJob, setUpdatedJob] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    skillsRequired: "",
    educationRequired: "",
    coursesPreferred: "",
    interests: "",
  });

  // Ensure jobs is always an array
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  // Handle Edit Click
  const handleEdit = (job) => {
    setEditingJob(job._id);
    setUpdatedJob({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      salary: job.salary || "",
      skillsRequired: job.skillsRequired?.join(", ") || "",
      educationRequired:
        job.educationRequired
          ?.map((edu) => `${edu.degree} in ${edu.field}`)
          .join(", ") || "",
      coursesPreferred:
        job.coursesPreferred
          ?.map((course) =>
            course.provider ? `${course.courseName} (${course.provider})` : course.courseName
          )
          .join(", ") || "",
      interests: job.interests?.join(", ") || "",
    });
  };

  // Handle Input Change
  const handleChange = (e) => {
    setUpdatedJob({ ...updatedJob, [e.target.name]: e.target.value });
  };

  // Handle Update
  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...updatedJob,
          skillsRequired: updatedJob.skillsRequired.split(",").map((s) => s.trim()),
          educationRequired: updatedJob.educationRequired
            .split(",")
            .map((edu) => {
              const [degree, field] = edu.split(" in ");
              return { degree: degree.trim(), field: field?.trim() || "" };
            }),
          coursesPreferred: updatedJob.coursesPreferred
            .split(",")
            .map((c) => {
              const match = c.match(/\((.*?)\)/);
              return match
                ? { courseName: c.replace(`(${match[1]})`, "").trim(), provider: match[1].trim() }
                : { courseName: c.trim() };
            }),
          interests: updatedJob.interests.split(",").map((i) => i.trim()),
        }),
      });

      if (!response.ok) throw new Error("Failed to update job");

      setEditingJob(null);
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete job");

      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  return (
    <div className="bg-white shadow-lg p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Available Jobs</h2>
      {safeJobs.length === 0 ? (
        <p className="text-gray-600">No jobs available.</p>
      ) : (
        <ul className="space-y-4">
          {safeJobs.map((job) => (
            <li key={job._id} className="border-b pb-4">
              {editingJob === job._id ? (
                <div>
                  <input
                    type="text"
                    name="title"
                    value={updatedJob.title}
                    onChange={handleChange}
                    className="w-full border p-2 mb-2"
                  />
                  <textarea
                    name="description"
                    value={updatedJob.description}
                    onChange={handleChange}
                    className="w-full border p-2 mb-2"
                  />
                  <input
                    type="text"
                    name="company"
                    value={updatedJob.company}
                    onChange={handleChange}
                    className="w-full border p-2 mb-2"
                  />
                  <input
                    type="text"
                    name="location"
                    value={updatedJob.location}
                    onChange={handleChange}
                    className="w-full border p-2 mb-2"
                  />
                  <input
                    type="text"
                    name="salary"
                    value={updatedJob.salary}
                    onChange={handleChange}
                    className="w-full border p-2 mb-2"
                  />
                  <input
                    type="text"
                    name="skillsRequired"
                    value={updatedJob.skillsRequired}
                    onChange={handleChange}
                    className="w-full border p-2 mb-2"
                  />
                  <input
                    type="text"
                    name="educationRequired"
                    value={updatedJob.educationRequired}
                    onChange={handleChange}
                    className="w-full border p-2 mb-2"
                  />
                  <input
                    type="text"
                    name="coursesPreferred"
                    value={updatedJob.coursesPreferred}
                    onChange={handleChange}
                    className="w-full border p-2 mb-2"
                  />
                  <input
                    type="text"
                    name="interests"
                    value={updatedJob.interests}
                    onChange={handleChange}
                    className="w-full border p-2 mb-2"
                  />

                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                    onClick={() => handleUpdate(job._id)}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={() => setEditingJob(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-gray-700">{job.description}</p>
                  <p><strong>Company:</strong> {job.company}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  {job.salary && <p><strong>Salary:</strong> ${job.salary}</p>}
                  {job.skillsRequired?.length > 0 && (
                    <p><strong>Skills Required:</strong> {job.skillsRequired.join(", ")}</p>
                  )}

                  <div className="mt-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                      onClick={() => handleEdit(job)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      onClick={() => handleDelete(job._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobList;
