const JobResult = ({ suggestion, isLoading }) => {
    if (isLoading) {
      return <div className="loading">Analyzing your profile...</div>;
    }
  
    if (!suggestion) {
      return <div className="instruction">Fill the form to get job suggestions</div>;
    }
  
    return (
      <div className="job-result">
        <h3>Job Suggestion:</h3>
        <div className="suggestion-text">{suggestion}</div>
      </div>
    );
  };
  
  export default JobResult;