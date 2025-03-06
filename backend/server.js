const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const EventEmitter = require('events');

dotenv.config();
connectDB();

const app = express();

// CORS middleware should be one of the first middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enhanced session management
const activeUsers = new Map(); // Store active user sessions
const userSockets = new Map(); // Map user IDs to their socket connections
const userSessions = new Map(); // Store user sessions

// Import routes
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const profileRoutes = require("./routes/profileRoutes");
const messageRoutes = require("./routes/messageRoutes");
const jobRoutes =  require("./routes/jobRoutes")
const userFollowRoutes = require("./routes/userFollowRoutes");

// Routes - after CORS and body parser middleware
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/jobs', jobRoutes);
app.use("/api/users", userFollowRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;

    // Store socket connection with unique identifier
    const sessionId = `${decoded.id}-${socket.id}`;
    userSessions.set(sessionId, {
      userId: decoded.id,
      socketId: socket.id,
      timestamp: Date.now(),
    });

    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  // Join user to their personal room using unique socket ID
  const userRoom = `user-${socket.userId}-${socket.id}`;
  socket.join(userRoom);

  socket.on("sendMessage", async (data) => {
    try {
      const { receiver, content } = data;
      const sender = socket.userId;

      const Message = require("./models/messageModel");
      const newMessage = await Message.create({
        sender,
        receiver,
        content,
        timestamp: new Date(),
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name email")
        .populate("receiver", "name email");

      // Send to all socket instances of the receiver
      Array.from(io.sockets.sockets.values())
        .filter((s) => s.userId === receiver)
        .forEach((s) => s.emit("newMessage", populatedMessage));

      // Send back to sender's specific socket
      socket.emit("newMessage", populatedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    const sessionId = `${socket.userId}-${socket.id}`;
    userSessions.delete(sessionId);
  });
});

// Error handling middleware should be last
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});


const progressEmitter = new EventEmitter();
app.set('progressEmitter', progressEmitter);

// Server-Sent Events endpoint
app.get('/api/jobs/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-open');

  const progressHandler = (progress) => {
    res.write(`data: ${JSON.stringify(progress)}\n\n`);
  };

  progressEmitter.on('jobInitProgress', progressHandler);

  req.on('close', () => {
    progressEmitter.removeListener('jobInitProgress', progressHandler);
  });
});




const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
