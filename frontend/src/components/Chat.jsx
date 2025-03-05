import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Send,
  Image as ImageIcon,
  Smile,
  Paperclip,
  MoreVertical,
} from "lucide-react";
import moment from "moment";

const Chat = ({ selectedUserId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);
  const [userStatus, setUserStatus] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize socket connection with reconnection logic
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !currentUserId) return;

    const initSocket = () => {
      const newSocket = io("http://localhost:5000", {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: { userId: currentUserId },
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected with ID:", currentUserId);
        setIsConnected(true);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
        setError("Connection error. Retrying...");
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      // Handle incoming messages
      newSocket.on("newMessage", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();
      });

      // Handle typing indicators
      newSocket.on("userTyping", ({ userId }) => {
        if (userId === selectedUserId) {
          setIsTyping(true);
        }
      });

      newSocket.on("userStoppedTyping", ({ userId }) => {
        if (userId === selectedUserId) {
          setIsTyping(false);
        }
      });

      // Handle user status updates
      newSocket.on("userStatus", ({ userId, status }) => {
        setUserStatus((prev) => ({
          ...prev,
          [userId]: status,
        }));
      });

      return newSocket;
    };

    const socket = initSocket();

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUserId, selectedUserId]);

  // Auto-reconnect logic
  useEffect(() => {
    let reconnectInterval;

    if (!isConnected && currentUserId) {
      reconnectInterval = setInterval(() => {
        if (!socketRef.current?.connected) {
          console.log("Attempting to reconnect...");
          socketRef.current?.connect();
        }
      }, 5000);
    }

    return () => {
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
    };
  }, [isConnected, currentUserId]);

  // Fetch selected user information
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!selectedUserId) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/users/${selectedUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSelectedUserInfo(response.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
        setError("Failed to load user information");
      }
    };

    fetchUserInfo();
  }, [selectedUserId]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUserId || !currentUserId) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/messages/${selectedUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages");
      }
    };

    fetchMessages();
  }, [selectedUserId, currentUserId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    try {
      socket.emit("sendMessage", {
        receiver: selectedUserId,
        content: newMessage.trim(),
      });

      setNewMessage("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit("stopTyping", {
          receiverId: selectedUserId,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  const handleTyping = () => {
    if (!socket || !isConnected) return;

    socket.emit("typing", {
      receiverId: selectedUserId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        receiverId: selectedUserId,
      });
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return moment(timestamp).calendar(null, {
      sameDay: "HH:mm",
      lastDay: "[Yesterday] HH:mm",
      lastWeek: "dddd HH:mm",
      sameElse: "DD/MM/YYYY HH:mm",
    });
  };

  const getUserStatus = () => {
    if (isTyping) return "typing...";
    if (!isConnected) return "offline";
    return userStatus[selectedUserId] || "online";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] border rounded-lg bg-gray-50 shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {selectedUserInfo?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{selectedUserInfo?.name}</h2>
            <p className="text-sm text-gray-500">{getUserStatus()}</p>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isFirstMessageOfGroup =
            index === 0 ||
            messages[index - 1].sender._id !== message.sender._id;
          const isLastMessageOfGroup =
            index === messages.length - 1 ||
            messages[index + 1].sender._id !== message.sender._id;

          return (
            <div
              key={message._id}
              className={`flex ${
                message.sender._id === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  isFirstMessageOfGroup ? "mt-2" : "mt-1"
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.sender._id === currentUserId
                      ? "bg-blue-500 text-white"
                      : "bg-white border"
                  } ${
                    !isFirstMessageOfGroup &&
                    message.sender._id === currentUserId
                      ? "rounded-tr-sm"
                      : ""
                  } ${
                    !isFirstMessageOfGroup &&
                    message.sender._id !== currentUserId
                      ? "rounded-tl-sm"
                      : ""
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                </div>
                {isLastMessageOfGroup && (
                  <p
                    className={`text-xs mt-1 ${
                      message.sender._id === currentUserId
                        ? "text-gray-500 text-right"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Smile size={20} />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

Chat.propTypes = {
  selectedUserId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
};

export default Chat;
