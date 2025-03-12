const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const userSchema = mongoose.Schema(
  {
    name: { type: String },
    userimage: { type: String },
    email: {
      type: String,
      unique: true,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Please provide a valid email",
      ],
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    password: { type: String, minlength: 6 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    jobPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }], // Jobs posted by this user
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
