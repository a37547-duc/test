const mongoose = require("mongoose");

// Tạo schema cho người dùng
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: function () {
      return this.authType === "local";
    },
  },
  password: {
    type: String,
    required: function () {
      return this.authType === "local";
    },
  },
  authType: {
    type: String,
    enum: ["local", "google"],
    required: true,
  },
  googleId: {
    type: String,
    required: function () {
      return this.authType === "google";
    },
  },
  phoneNumber: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["Nam", "Nữ", "Khác"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  refreshToken: {
    type: String,
  },
});

// Tạo model từ schema
const User = mongoose.model("User", userSchema);

module.exports = User;
