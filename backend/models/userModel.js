const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    userimage: {
      type: String,
    },
    email: {
      type: String,
      // required: true,
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
      default: () => uuidv4(), // Generate a unique UUID for studentId
    },
    password: {
      type: String,
      // required: true,
      minlength: 6,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References other users who follow this user
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References users that this user follows
      },
    ],
    otp: {
      type: String, // OTP for verification
    },
    otpExpires: {
      type: Date, // Expiration time for OTP
    },
    resetPasswordOTP: {
      type: String,
    },
    resetPasswordOTPExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false, // Indicates whether the user has verified their OTP
    },
  },
  { timestamps: true }
);

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password Hashed Successfully:", this.password);
    next();
  } catch (error) {
    return next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log("Entered Password:", enteredPassword);
  console.log("Stored Hashed Password:", this.password);
  
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log("Password Match Result:", isMatch);
  return isMatch;
};



module.exports = mongoose.model("User", userSchema);
