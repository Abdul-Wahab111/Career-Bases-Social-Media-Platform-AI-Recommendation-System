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

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex gap-4">
          {/* Users list */}
          <div className="w-1/4 border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-4">Users</h2>
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${
                    selectedUser?._id === user._id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No users found</div>
            )}
          </div>

          {/* Chat area */}
          <div className="flex-1">
            {selectedUser && currentUser ? (
              <Chat
                currentUserId={currentUser._id}
                selectedUserId={selectedUser._id}
              />
            ) : (
              <div className="text-center text-gray-500 mt-10">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
