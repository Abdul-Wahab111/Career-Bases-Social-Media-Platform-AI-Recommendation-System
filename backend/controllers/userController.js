const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // True for 465, false for other ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// @desc    Send OTP for user registration
// @route   POST /api/users/send-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  // Save OTP to the database
  await User.findOneAndUpdate(
    { email },
    { otp, otpExpires },
    { upsert: true, new: true }
  );

  // Send OTP via email
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "Your OTP for Registration",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);

  res.json({ message: "OTP sent successfully" });
});

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find user with email
  const user = await User.findOne({ email });

  if (!user || !user.otp || !user.otpExpires || user.otp !== otp) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // Check if OTP has expired
  if (user.otpExpires < new Date()) {
    res.status(400);
    throw new Error("OTP has expired. Request a new one.");
  }

  // Clear OTP and OTP expiration
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ message: "OTP verified successfully" });
});

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    user.name = name;
    user.password = password; // Assign plain password
    user.markModified("password"); // Ensure pre-save hook triggers
    user.isVerified = true;
  } else {
    user = new User({
      name,
      email,
      password, // Assign plain password
      isVerified: true,
    });
  }

  await user.save();

  console.log("User registered with hashed password:", user.password);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});

// @desc    Authenticate user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password (User not found)");
  }

  console.log("Entered Password:", password);
  console.log("Stored Hashed Password:", user.password);

  const isMatch = await user.matchPassword(password);
  console.log("Password Match:", isMatch);

  if (isMatch) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password (Password mismatch)");
  }
});


// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("name email _id");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});



const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found with this email");
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  // Save OTP to the user
  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = otpExpires;
  await user.save();

  // Send OTP via email
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "Your Password Reset OTP",
    text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);

  res.json({ message: "Password reset OTP sent successfully" });
});

// @desc    Reset password with OTP
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Find user with email
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Verify OTP
  if (
    !user.resetPasswordOTP ||
    !user.resetPasswordOTPExpires ||
    user.resetPasswordOTP !== otp
  ) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  // Check if OTP has expired
  if (user.resetPasswordOTPExpires < new Date()) {
    res.status(400);
    throw new Error("OTP has expired. Request a new one.");
  }

  // Update password
  user.password = newPassword;
  
  // Clear OTP fields
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;
  
  await user.save();

  res.json({ message: "Password reset successful" });
});
module.exports = {
  sendOTP,
  verifyOTP,
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  forgotPassword,
  resetPassword,
};