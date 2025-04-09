# Career-Bases-Social-Media-Platform-AI-Recommendation-System
A social networking platform designed to connect students and professionals while offering intelligent job recommendations based on user profiles using AI.

Key Responsibilities & Features:
Developed a full stack web application using MongoDB, Express.js, React.js, and Node.js (MERN).
Implemented secure user authentication with registration, login, and email verification using OTP via Nodemailer.
Built a detailed profile creation system capturing education, skills, bio, interests, courses, and profile picture (stored via Cloudinary).
Enabled users to create, edit, and delete posts with optional image uploads and real-time timestamp display (e.g., "2 hours ago").
Integrated post interaction features including like, comment, and time tracking for comments.
Developed a job posting module allowing users to post job listings with details like description, requirements, skills, education, courses, and optional salary.
Designed a job application workflow with resume uploads (Cloudinary) and cover letter submission
Displayed the number of applicants per job and recommended missing skills during application, by comparing job requirements to user profiles.
Created a smart job recommendation engine using:
   -> Pinecone vector database for semantic similarity.
   -> Gemini AI (RAG model) to match jobs to users based on skills, education, and interests.
   -> Fallback to text-based matching with custom scoring logic when AI is rate-limited.
Added a search functionality for discovering users based on name, bio, or skills.
Implemented follow/unfollow functionality to build user networks similar to LinkedIn.
Built a real-time messaging system for direct user communication (using technologies like Socket.io).
Included a light/dark mode toggle to enhance user experience and accessibility.
Designed and maintained a responsive and intuitive web interface ensuring smooth navigation and user experience across devices.
