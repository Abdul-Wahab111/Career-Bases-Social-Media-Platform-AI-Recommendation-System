import React, { useState, useEffect } from 'react';

const JobsFilter = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [salary, setSalary] = useState({ min: 0, max: 1000000 });
  
  // Common locations for quick selection
  const commonLocations = [
    'Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Toronto', 'Sydney'
  ];

  // Common skills for suggestions
  const commonSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 
    'Docker', 'TypeScript', 'MongoDB', 'Express', 'DevOps', 'UI/UX', 'Git'
  ];

  // Apply filters when they change
  useEffect(() => {
    const newFilters = { location, skills, salary };
  
    // Avoid unnecessary re-renders
    setTimeout(() => {
      onFilterChange(newFilters);
    }, 200);
  }, [location, skills, salary]);
  
  // Add skill to filter
  const addSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput('');
    }
  };

  // Remove skill from filter
  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (skillInput) {
      addSkill(skillInput);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-600 hover:text-blue-800"
        >
          {isOpen ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Location Filter */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Location</label>
            <input
              type="text"
              placeholder="Enter location..."
              className="w-full p-2 border rounded"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {commonLocations.map(loc => (
                <button
                  key={loc}
                  type="button"
                  className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
                  onClick={() => setLocation(loc)}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Filter */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Skills</label>
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="text"
                placeholder="Add a skill..."
                className="flex-1 p-2 border rounded-l"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 bg-blue-600 text-white rounded-r hover:bg-blue-700"
              >
                Add
              </button>
            </form>
            
            {/* Skill suggestions */}
            <div className="mt-2 flex flex-wrap gap-2">
              {commonSkills.filter(skill => !skills.includes(skill)).slice(0, 5).map(skill => (
                <button
                  key={skill}
                  type="button"
                  className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
                  onClick={() => addSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
            
            {/* Selected skills */}
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center"
                >
                  {skill}
                  <button
                    type="button"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => removeSkill(skill)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Salary Range Filter */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Salary Range: ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}
            </label>
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={salary.min}
                  onChange={(e) => setSalary({ ...salary, min: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">Min: ${salary.min.toLocaleString()}</span>
              </div>
              <div className="flex-1">
                <input
                  type="range"
                  min={salary.min}
                  max="1000000"
                  step="10000"
                  value={salary.max}
                  onChange={(e) => setSalary({ ...salary, max: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">Max: ${salary.max.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="pt-2">
            <button
              type="button"
              className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => {
                setLocation('');
                setSkills([]);
                setSalary({ min: 0, max: 1000000 });
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsFilter;