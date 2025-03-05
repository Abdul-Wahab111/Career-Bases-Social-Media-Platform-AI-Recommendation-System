import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Posts from "./pages/Posts";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";
import Chat from "./pages/Chat";
import HomePage from "./pages/HomePage";
function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={!isLoggedIn ? <Login /> : <Navigate to="/posts" />}
        />
        <Route
          path="/register"
          element={!isLoggedIn ? <Register /> : <Navigate to="/posts" />}
        />
        
        {/* Private Routes */}
       
        <Route
          path="/posts"
          element={isLoggedIn ? <Posts /> : <Navigate to="/login" />}
        />
        
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={isLoggedIn ? <Chat /> : <Navigate to="/login" />}
        />
        <Route
          path="/logout"
          element={
            isLoggedIn ? <Logout /> : <Navigate to="/login" replace={true} />
          }
        />
        ;{/* Catch-all Route */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
