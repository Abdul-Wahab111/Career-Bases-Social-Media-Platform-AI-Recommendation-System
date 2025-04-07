"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { io } from "socket.io-client"
import axios from "axios"
import PropTypes from "prop-types"
import { Send, Smile, Paperclip, MoreVertical } from "lucide-react"
import moment from "moment"

const Chat = ({ selectedUserId, currentUserId, onNewMessage }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [socket, setSocket] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedUserInfo, setSelectedUserInfo] = useState(null)
  const [userStatus, setUserStatus] = useState({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachmentPreview, setAttachmentPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadMessages, setUnreadMessages] = useState([])
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const socketRef = useRef(null)
  const fileInputRef = useRef(null)

  // Mock emojis for the emoji picker
  const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "😎", "🙏", "😢", "😍", "🤔", "👋", "🥳", "😴", "🤩"]

  // Initialize socket connection with reconnection logic
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token || !currentUserId) return

    const initSocket = () => {
      const newSocket = io("http://localhost:5000", {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: { userId: currentUserId },
      })

      socketRef.current = newSocket
      setSocket(newSocket)

      newSocket.on("connect", () => {
        console.log("Socket connected with ID:", currentUserId)
        setIsConnected(true)
      })

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
        setIsConnected(false)
        setError("Connection error. Retrying...")
      })

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected")
        setIsConnected(false)
      })

      // Handle incoming messages
      newSocket.on("newMessage", (message) => {
        setMessages((prevMessages) => [...prevMessages, message])

        // If the message is from the selected user, mark it as read
        // Otherwise, add it to unread messages and notify parent component
        if (message.sender._id !== currentUserId) {
          if (message.sender._id === selectedUserId) {
            // Mark as read immediately since we're in this conversation
            markMessageAsRead(message._id)
          } else {
            // Add to unread messages and notify parent
            setUnreadMessages((prev) => [...prev, message._id])
            if (onNewMessage) {
              onNewMessage(message.sender._id)
            }
          }
        }

        scrollToBottom()
      })

      // Handle typing indicators
      newSocket.on("userTyping", ({ userId }) => {
        if (userId === selectedUserId) {
          setIsTyping(true)
        }
      })

      newSocket.on("userStoppedTyping", ({ userId }) => {
        if (userId === selectedUserId) {
          setIsTyping(false)
        }
      })

      // Handle user status updates
      newSocket.on("userStatus", ({ userId, status }) => {
        setUserStatus((prev) => ({
          ...prev,
          [userId]: status,
        }))
      })

      return newSocket
    }

    const socket = initSocket()

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect()
        socketRef.current = null
      }
    }
  }, [currentUserId, selectedUserId, onNewMessage])

  // Auto-reconnect logic
  useEffect(() => {
    let reconnectInterval

    if (!isConnected && currentUserId) {
      reconnectInterval = setInterval(() => {
        if (!socketRef.current?.connected) {
          console.log("Attempting to reconnect...")
          socketRef.current?.connect()
        }
      }, 5000)
    }

    return () => {
      if (reconnectInterval) {
        clearInterval(reconnectInterval)
      }
    }
  }, [isConnected, currentUserId])

  // Fetch selected user information
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!selectedUserId) return
      setIsLoading(true)

      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`http://localhost:5000/api/users/${selectedUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSelectedUserInfo(response.data)
      } catch (error) {
        console.error("Error fetching user info:", error)
        setError("Failed to load user information")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserInfo()
  }, [selectedUserId])

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUserId || !currentUserId) return
      setIsLoading(true)

      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`http://localhost:5000/api/messages/${selectedUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMessages(response.data)

        // Mark all unread messages from this user as read
        const unreadIds = response.data
          .filter((msg) => msg.sender._id === selectedUserId && !msg.read)
          .map((msg) => msg._id)

        if (unreadIds.length > 0) {
          markMessagesAsRead(unreadIds)
        }

        setTimeout(() => {
          scrollToBottom()
        }, 100)
      } catch (error) {
        console.error("Error fetching messages:", error)
        setError("Failed to load messages")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [selectedUserId, currentUserId])

  // Mark a single message as read
  const markMessageAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem("token")
      // In a real app, you would have an API endpoint to mark messages as read
      console.log(`Marking message ${messageId} as read`)

      // Update local state to mark message as read
      setMessages((prevMessages) => prevMessages.map((msg) => (msg._id === messageId ? { ...msg, read: true } : msg)))
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  // Mark multiple messages as read
  const markMessagesAsRead = async (messageIds) => {
    try {
      const token = localStorage.getItem("token")
      // In a real app, you would have an API endpoint to mark messages as read
      console.log(`Marking messages as read: ${messageIds.join(", ")}`)

      // Update local state to mark messages as read
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (messageIds.includes(msg._id) ? { ...msg, read: true } : msg)),
      )
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !attachmentPreview) || !isConnected) return

    try {
      socket.emit("sendMessage", {
        receiver: selectedUserId,
        content: newMessage.trim() || (attachmentPreview ? "Sent an attachment" : ""),
        // In a real app, you would upload the attachment and send the URL
      })

      setNewMessage("")
      setAttachmentPreview(null)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        socket.emit("stopTyping", {
          receiverId: selectedUserId,
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message")
    }
  }

  const handleTyping = () => {
    if (!socket || !isConnected) return

    socket.emit("typing", {
      receiverId: selectedUserId,
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        receiverId: selectedUserId,
      })
    }, 2000)
  }

  const formatTime = (timestamp) => {
    return moment(timestamp).calendar(null, {
      sameDay: "HH:mm",
      lastDay: "[Yesterday] HH:mm",
      lastWeek: "dddd HH:mm",
      sameElse: "DD/MM/YYYY HH:mm",
    })
  }

  const getUserStatus = () => {
    if (isTyping) return "typing..."
    if (!isConnected) return "offline"
    return userStatus[selectedUserId] || "online"
  }

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // In a real app, you would upload this file to your server
    // For now, we'll just create a preview
    const reader = new FileReader()
    reader.onload = () => {
      setAttachmentPreview({
        name: file.name,
        type: file.type,
        url: reader.result,
      })
    }
    reader.readAsDataURL(file)
  }

  const removeAttachment = () => {
    setAttachmentPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = moment(message.timestamp).format("YYYY-MM-DD")
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Count unread messages from the selected user
  const unreadCount = messages.filter((msg) => msg.sender._id === selectedUserId && !msg.read).length

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
              {selectedUserInfo?.name ? getUserInitials(selectedUserInfo.name) : "?"}
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isConnected ? "bg-green-500" : "bg-gray-400"}`}
            ></div>
          </div>
          <div>
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">{selectedUserInfo?.name || "Loading..."}</h2>

              {/* Unread message badge */}
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className={`text-xs ${isTyping ? "text-green-500 font-medium" : "text-gray-500"}`}>{getUserStatus()}</p>
          </div>
        </div>

        <div className="flex items-center">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No messages yet</p>
            <p className="text-gray-500 text-sm mt-1">Start the conversation by sending a message</p>
          </div>
        ) : (
          Object.entries(groupedMessages)
            .sort((a, b) => {
              // Sort dates in ascending order (oldest first, newest last)
              return new Date(a[0]).getTime() - new Date(b[0]).getTime()
            })
            .map(([date, dateMessages]) => (
              <div key={date} className="space-y-2">
                <div className="flex justify-center">
                  <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {moment(date).calendar(null, {
                      sameDay: "[Today]",
                      lastDay: "[Yesterday]",
                      lastWeek: "dddd",
                      sameElse: "MMMM D, YYYY",
                    })}
                  </div>
                </div>

                {dateMessages.map((message, index) => {
                  const isFirstMessageOfGroup = index === 0 || dateMessages[index - 1].sender._id !== message.sender._id
                  const isLastMessageOfGroup =
                    index === dateMessages.length - 1 || dateMessages[index + 1].sender._id !== message.sender._id
                  const isSentByCurrentUser = message.sender._id === currentUserId
                  const isUnread = !message.read && message.sender._id !== currentUserId

                  return (
                    <div key={message._id} className={`flex ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}>
                      {!isSentByCurrentUser && isFirstMessageOfGroup && (
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 self-end mb-1">
                          {getUserInitials(message.sender.name)}
                        </div>
                      )}

                      <div className={`max-w-[75%] ${isFirstMessageOfGroup ? "mt-2" : "mt-1"}`}>
                        <div
                          className={`p-3 rounded-2xl ${
                            isSentByCurrentUser
                              ? "bg-blue-500 text-white"
                              : isUnread
                                ? "bg-white shadow-sm border-l-4 border-blue-500"
                                : "bg-white shadow-sm"
                          } ${!isFirstMessageOfGroup && isSentByCurrentUser ? "rounded-tr-sm" : ""} ${
                            !isFirstMessageOfGroup && !isSentByCurrentUser ? "rounded-tl-sm" : ""
                          } ${isSentByCurrentUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
                        >
                          <p className="break-words">{message.content}</p>
                        </div>
                        {isLastMessageOfGroup && (
                          <div
                            className={`flex items-center mt-1 ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <p className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                              {isSentByCurrentUser && (
                                <span className={`ml-1 ${message.read ? "text-blue-500" : "text-gray-400"}`}>
                                  {message.read ? "Read" : "Sent"}
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachmentPreview && (
        <div className="p-3 bg-gray-100 border-t border-gray-200">
          <div className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
            <div className="flex items-center">
              {attachmentPreview.type.startsWith("image/") ? (
                <div className="w-12 h-12 rounded overflow-hidden mr-3">
                  <img
                    src={attachmentPreview.url || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="truncate">
                <p className="text-sm font-medium">{attachmentPreview.name}</p>
                <p className="text-xs text-gray-500">Ready to send</p>
              </div>
            </div>
            <button onClick={removeAttachment} className="p-1 hover:bg-gray-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="p-2 bg-white border-t border-gray-200 grid grid-cols-5 gap-2">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="text-2xl hover:bg-gray-100 p-2 rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Smile size={20} />
            </button>
            <button
              type="button"
              onClick={handleAttachmentClick}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              placeholder="Type a message..."
              className="w-full p-3 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              disabled={!isConnected}
            />
          </div>

          <button
            type="submit"
            disabled={(!newMessage.trim() && !attachmentPreview) || !isConnected}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}

Chat.propTypes = {
  selectedUserId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  onNewMessage: PropTypes.func,
}

export default Chat

