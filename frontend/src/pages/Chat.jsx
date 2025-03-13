import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import Chat from "../components/Chat";

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showUserList, setShowUserList] = useState(true);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      setShowUserList(window.innerWidth >= 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle user list on mobile
  const toggleUserList = () => {
    setShowUserList(!showUserList);
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setCurrentUser({ _id: decoded.id });
      } catch (error) {
        console.error("Error getting user from token:", error);
        setError("Invalid authentication token");
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");

          const response = await axios.get("http://localhost:5000/api/users", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const filteredUsers = response.data.filter(
            (user) => user._id !== currentUser._id
          );
          setUsers(filteredUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
          setError(error.response?.data?.message || "Error fetching users");
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [currentUser]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Get random color for user avatar
  const getUserColor = (userId) => {
    const colors = [
      "from-pink-500 to-rose-500",
      "from-purple-500 to-indigo-500",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-500"
    ];
    
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="flex h-[calc(100vh-150px)]">
            {/* Users list - conditionally shown on mobile */}
            {(showUserList || !isMobileView) && (
              <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => {
                            setSelectedUser(user);
                            if (isMobileView) setShowUserList(false);
                          }}
                          className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${
                            selectedUser?._id === user._id ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${getUserColor(user._id)} rounded-full flex items-center justify-center text-white font-semibold shadow-sm`}>
                              {getUserInitials(user.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline">
                                <h3 className="text-sm font-medium text-gray-900 truncate">{user.name}</h3>
                              </div>
                              <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-gray-600 font-medium">No contacts found</p>
                      <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {selectedUser && currentUser ? (
                <>
                  {/* Mobile back button */}
                  {isMobileView && !showUserList && (
                    <button 
                      onClick={toggleUserList}
                      className="md:hidden p-2 m-2 bg-gray-100 rounded-full absolute top-0 left-0 z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  <Chat
                    currentUserId={currentUser._id}
                    selectedUserId={selectedUser._id}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8 text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Your Messages</h3>
                  <p className="text-gray-600 max-w-sm mb-6">Select a contact to start chatting. Your conversations will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
