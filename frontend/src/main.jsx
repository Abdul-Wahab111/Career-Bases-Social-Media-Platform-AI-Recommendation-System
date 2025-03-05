import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
// import React, { useState } from "react";
// import axios from "axios";
// import JobInitializer from "./components/JobInitialize";

// const App = () => {
//   const [suggestion, setSuggestion] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleGetSuggestion = async () => {
//     setIsLoading(true);
//     setError("");
//     setSuggestion("");

//     try {
//       // Correct API endpoint with full URL
//       const response = await axios.post(
//         "http://localhost:5000/api/jobs/suggest",
//         {
//           Skills: "SAP, ERP",
//           Education: "Business Administration",
//           Courses: "Enterprise Software",
//           Interests: "Business",
//         }
//       );

//       console.log("API Response:", response.data);
//       setSuggestion(response.data.suggestion);
//     } catch (error) {
//       console.error("Error fetching job suggestion:", error);

//       // More detailed error handling
//       if (error.response) {
//         // The request was made and the server responded with a status code
//         // that falls out of the range of 2xx
//         setError(error.response.data.error || "Server error occurred");
//       } else if (error.request) {
//         // The request was made but no response was received
//         setError("No response from server. Check your network connection.");
//       } else {
//         // Something happened in setting up the request
//         setError("Error setting up the request");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <JobInitializer />

//         <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
//           AI Job Suggestor
//         </h1>

//         <button
//           onClick={handleGetSuggestion}
//           disabled={isLoading}
//           className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
//         >
//           {isLoading ? "Loading..." : "Get Job Suggestion"}
//         </button>

//         {suggestion && (
//           <div className="mt-6 p-4 bg-gray-50 rounded-md">
//             <h2 className="text-lg font-semibold text-gray-700 mb-2">
//               Job Suggestion:
//             </h2>
//             <p className="text-gray-600 whitespace-pre-wrap">{suggestion}</p>
//           </div>
//         )}

//         {error && (
//           <div className="mt-6 p-4 bg-red-50 rounded-md">
//             <p className="text-red-600">{error}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default App;
