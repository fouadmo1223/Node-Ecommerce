const mongoose = require("mongoose");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const bcrypt = require("bcryptjs");
// ------------------------------------------------------
// @desc    Get All Users (with pagination, sort, search & filter)
// @route   GET /api/users?page=&limit=&sort=asc|desc&keyword=&age[gte]=20
// @access  private
// ------------------------------------------------------
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const sort = req.query.sort === "desc" ? -1 : 1;

  // 1️⃣ Base filter (copy query)
  let filter = { ...req.query };
  const excludedFields = ["page", "limit", "sort", "keyword"];
  excludedFields.forEach((el) => delete filter[el]);

  // 2️⃣ Advanced filter for gte, lte, gt, lt
  let queryStr = JSON.stringify(filter);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  filter = JSON.parse(queryStr);

  // 3️⃣ Keyword search (username + email)
  if (req.query.keyword) {
    filter.$or = [
      { username: { $regex: req.query.keyword, $options: "i" } },
      { email: { $regex: req.query.keyword, $options: "i" } },
    ];
  }

  // 4️⃣ Query building
  let query = User.find(filter)
    .select("-password")
    .sort({ createdAt: sort })
    .skip(skip)
    .limit(limit);

  // 5️⃣ Execute query
  const users = await query;
  const total = await User.countDocuments(filter);

  res.status(200).json({
    message: "Users fetched successfully",
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: users,
  });
});

// ------------------------------------------------------
// @desc    Create New User
// @route   POST /api/users
// @access  Private/Admin (for example)
// ------------------------------------------------------
const createUser = asyncHandler(async (req, res) => {
  const { userName, email, password, phone, role, porfileImage } = req.body;

  // 1️⃣ Validate required fields
  if (!userName || !email || !password) {
    return res.status(400).json({
      message: "userName, email and password are required",
      success: false,
    });
  }

  // 2️⃣ Check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      message: "Email already exists",
      success: false,
    });
  }

  // 3️⃣ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4️⃣ Create new user
  const newUser = await User.create({
    userName,
    email,
    password: hashedPassword,
    phone,
    role,
    porfileImage,
  });

  // 5️⃣ Respond
  res.status(201).json({
    message: "User created successfully",
    success: true,
    data: {
      _id: newUser._id,
      userName: newUser.userName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      porfileImage: newUser.porfileImage,
    },
  });
});

// ------------------------------------------------------
// @desc    Get Single User
// @route   GET /api/users/:id
// @access  private
// ------------------------------------------------------
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid User ID");
  }
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({
    message: "User fetched successfully",
    success: true,
    data: user,
  });
});

// ------------------------------------------------------
// @desc    Get Single User
// @route   GET /api/users/my-profile
// @access  private
// ------------------------------------------------------
const getMyProfile = asyncHandler(async (req, res) => {
  const id = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid User ID");
  }
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({
    message: "User fetched successfully",
    success: true,
    data: user,
  });
});

// ------------------------------------------------------
// @desc    Update User
// @route   PUT /api/users/:id
// @access  Private/Admin (example)
// ------------------------------------------------------
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid User ID",
      success: false,
    });
  }

  const { userName, email, password, phone, role, porfileImage } = req.body;

  // Find user
  let user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
    });
  }

  // If updating password → hash it
  let hashedPassword;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Update fields
  user.userName = userName || user.userName;
  user.email = email || user.email;
  user.password = hashedPassword || user.password;
  user.phone = phone || user.phone;
  user.role = role || user.role;
  user.porfileImage = porfileImage || user.porfileImage;

  const updatedUser = await user.save();

  res.status(200).json({
    message: "User updated successfully",
    success: true,
    data: {
      _id: updatedUser._id,
      userName: updatedUser.userName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      porfileImage: updatedUser.porfileImage,
    },
  });
});

// ------------------------------------------------------
// @desc    Update User
// @route   PUT /api/users/my-profile
// @access  Private/user
// ------------------------------------------------------
const updateMyProfile = asyncHandler(async (req, res) => {
  const id = req.user._id;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid User ID",
      success: false,
    });
  }

  const { userName, email, password, phone, role, porfileImage } = req.body;

  // Find user
  let user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
    });
  }

  // If updating password → hash it
  let hashedPassword;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Update fields
  user.userName = userName || user.userName;
  user.email = email || user.email;
  user.password = hashedPassword || user.password;
  user.phone = phone || user.phone;
  user.role = role || user.role;
  user.porfileImage = porfileImage || user.porfileImage;

  const updatedUser = await user.save();

  res.status(200).json({
    message: "User updated successfully",
    success: true,
    data: {
      _id: updatedUser._id,
      userName: updatedUser.userName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      porfileImage: updatedUser.porfileImage,
    },
  });
});

// ------------------------------------------------------
// @desc    Delete User
// @route   DELETE /api/users/:id
// @access  private
// ------------------------------------------------------
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid User ID");
  }

  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    message: "User deleted successfully",
    success: true,
  });
});

// ------------------------------------------------------
// @desc    Block / Unblock User
// @route   PATCH /api/users/:id/block
// @access  Private/Admin
// ------------------------------------------------------
const toggleBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid User ID",
      success: false,
    });
  }

  // Find user
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
    });
  }

  // Toggle isBlocked
  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(200).json({
    message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
    success: true,
    data: {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      isBlocked: user.isBlocked,
      role: user.role,
    },
  });
});

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  toggleBlockUser,
  getMyProfile,
  updateMyProfile,
};
