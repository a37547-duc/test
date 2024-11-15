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
    unique: true,
    trim: true,
    lowercase: true,
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
