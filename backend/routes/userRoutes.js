const express = require("express");
const {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);

module.exports = router;