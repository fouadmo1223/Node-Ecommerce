const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      trim: true,
      min: [2, "UserName Must be at least 2 characters"],
      max: [20, "UserName must be at most 20 characters"],
      required: [true, "UserName is required"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      trim: true,
      min: [6, "Password Must be at least 6 characters"],
      required: [true, "Password is required"],
    },
    porfileImage: {
      type: String,
      default: "default.jpg",
    },
    phone: String,
    role: {
      type: String,
      enum: ["admin", "user", "manager"],
      default: "user",
    },
    isBlocked: { type: Boolean, default: false },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
