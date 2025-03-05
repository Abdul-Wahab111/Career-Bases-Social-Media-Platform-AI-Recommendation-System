import { useState } from 'react';

const JobForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    Skills: '',
    Education: '',
    Courses: '',
    Interests: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      <div className="form-group">
        <label>Skills:</label>
        <input
          type="text"
          name="Skills"
          value={formData.Skills}
          onChange={handleChange}
          placeholder="e.g., JavaScript, Python"
          required
        />
      </div>

      <div className="form-group">
        <label>Education:</label>
        <input
          type="text"
          name="Education"
          value={formData.Education}
          onChange={handleChange}
          placeholder="e.g., Bachelor in Computer Science"
          required
        />
      </div>

      <div className="form-group">
        <label>Courses:</label>
        <input
          type="text"
          name="Courses"
          value={formData.Courses}
          onChange={handleChange}
          placeholder="e.g., Machine Learning, Web Development"
        />
      </div>

      <div className="form-group">
        <label>Interests:</label>
        <input
          type="text"
          name="Interests"
          value={formData.Interests}
          onChange={handleChange}
          placeholder="e.g., AI, Cloud Computing"
        />
      </div>

      <button type="submit" className="submit-btn">
        Get Job Suggestions
      </button>
    </form>
  );
};

export default JobForm;