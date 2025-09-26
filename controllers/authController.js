const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateJWT");
const generateOtp = require("../utils/generateOtp");
const otpModel = require("../models/otpModel");
const { sendEmail } = require("../middlewares/sendEmail");

// ------------------------------------------------------
// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
// ------------------------------------------------------
const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, phone, password, confirmPassword } = req.body;

  // 1️⃣ Validate fields
  if (!userName || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  // 2️⃣ Check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  // 3️⃣ Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4️⃣ Create user
  const user = await User.create({
    userName,
    email,
    phone,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          phone: user.phone,
        },
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid user data",
    });
  }
});

// ------------------------------------------------------
// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
// ------------------------------------------------------
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  // 2️⃣ Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // 3️⃣ Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  if (user.isBlocked) {
    return res.status(403).json({
      success: false,
      message: "Your account has been blocked. Please contact support.",
    });
  }

  // 4️⃣ Success → return user + token
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    },
    token: generateToken(user._id, user.role, user.email, user.userName),
  });
});

// @desc Forgot Password - send OTP
// @route POST /api/auth/forgotpassword
// @access Public

const forgotPass = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "User email is required",
    });
  }

  // 🔹 Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "This user does not exist",
    });
  }

  // 🔹 Remove any old OTPs for this user
  await otpModel.deleteMany({ userId: user._id });

  // 🔹 Generate new OTP
  const otp = generateOtp();

  // 🔹 Hash OTP before saving (for security)
  const hash = crypto
    .createHmac("sha256", process.env.CRYPTO_SECRET)
    .update(otp)
    .digest("hex");

  // 🔹 Save OTP in DB with expiry (20 minutes)
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 mins

  await otpModel.create({
    userId: user._id,
    otp: hash,
    expiresAt,
  });

  // 🔹 Here you would send `otp` via email or SMS
  // await sendEmail(user.email, "Your OTP Code", `Your OTP is: ${otp}`);
  const html = `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f9f9f9; color: #333;">
  <h2 style="color: #4a90e2; text-align: center;">Your OTP Code 🔐</h2>
  
  <p style="font-size: 16px;">Hi ${user.userName || "there"},</p>
  <p style="font-size: 16px;">You requested a One-Time Password (OTP). Use the code below to proceed:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <p style="font-size: 28px; font-weight: bold; color: #4a90e2; letter-spacing: 4px; background: #fff; padding: 12px 20px; border-radius: 6px; display: inline-block; border: 1px solid #ddd;">
      ${otp}
    </p>
  </div>
  
  <p style="font-size: 14px; color: #555;">This code will expire in <strong>20 minutes</strong>. Please do not share it with anyone.</p>
  
  <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn’t request this, you can safely ignore this message.</p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
  <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} My Blog. All rights reserved.</p>
</div>
`;

  await sendEmail(user.email, "Your OTP Code", html);

  return res.status(200).json({
    success: true,
    message: "OTP has been sent to your email",
    // ⚠️ Only include for testing:
    // otp,
  });
});

// @desc Verify OTP
// @route POST /api/auth/verify-otp
// @access Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  // 🔹 Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "This user does not exist",
    });
  }

  // 🔹 Find OTP record
  const otpRecord = await otpModel.findOne({ userId: user._id });
  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: "No OTP found or OTP expired",
    });
  }

  // 🔹 Check expiry
  if (otpRecord.expiresAt < new Date()) {
    await otpModel.deleteOne({ _id: otpRecord._id }); // clean up expired OTP
    return res.status(400).json({
      success: false,
      message: "OTP has expired, please request a new one",
    });
  }

  // 🔹 Hash entered OTP and compare
  const hash = crypto
    .createHmac("sha256", process.env.CRYPTO_SECRET)
    .update(otp)
    .digest("hex");

  if (hash !== otpRecord.otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  // 🔹 OTP is valid → delete it after verification (one-time use)
  await otpModel.deleteOne({ _id: otpRecord._id });

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully. You can now reset your password",
  });
});

// @desc Reset Password
// @route POST /api/auth/reset-password
// @access Public (but must be after OTP verification)
const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  // 🔹 Validate input
  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, new password, and confirm password are required",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  // 🔹 Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // 🔹 Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // 🔹 Update user password
  user.password = hashedPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message:
      "Password reset successfully. You can now log in with your new password.",
  });
});

module.exports = {
  registerUser,
  loginUser,
  forgotPass,
  verifyOtp,
  resetPassword,
};
