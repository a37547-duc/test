const mongoose = require("mongoose");

// // Tạo schema cho người dùng
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
    required: true,
  },
  // authMethod: {
  //   type: String,
  //   enum: ["local", "google"], // Chỉ chấp nhận 'local' hoặc 'google'
  //   required: true,
  // },
  // googleId: {
  //   type: String,
  //   unique: true,
  //   sparse: true, // Chỉ có giá trị nếu đăng ký bằng Google
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware để mã hóa mật khẩu trước khi lưu (chỉ áp dụng cho phương thức 'local')
// userSchema.pre("save", async function (next) {
//   if (this.authMethod === "local" && this.isModified("password")) {
//     const bcrypt = require("bcrypt");
//     this.password = await bcrypt.hash(this.password, 10); // Mã hóa mật khẩu với độ dài salt 10
//   }
//   next();
// });

// Tạo model từ schema
const User = mongoose.model("User", userSchema);

module.exports = User;

// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   googleId: {
//     type: String,
//     required: true,
//     unique: true, // Đảm bảo googleId là duy nhất
//   },
//   displayName: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true, // Đảm bảo email là duy nhất
//   },
//   avatar: {
//     type: String,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const User = mongoose.model("User", userSchema);

// module.exports = User;
