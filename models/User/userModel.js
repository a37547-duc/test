// const mongoose = require("mongoose");

// // Tạo schema cho người dùng
// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true,
//     unique: function () {
//       return this.authType === "local";
//     },
//   },
//   password: {
//     type: String,
//     required: function () {
//       return this.authType === "local";
//     },
//   },
//   authType: {
//     type: String,
//     enum: ["local", "google"],
//     required: true,
//   },
//   googleId: {
//     type: String,
//     required: function () {
//       return this.authType === "google";
//     },
//   },
//   phoneNumber: {
//     type: String,
//   },
//   dateOfBirth: {
//     type: String,
//   },
//   gender: {
//     type: String,
//     enum: ["Nam", "Nữ", "Khác"],
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
//   refreshToken: {
//     type: String,
//   },
//   verified: {
//     type: Boolean,
//     default: false,
//   },
// });

// // Tạo model từ schema
// const User = mongoose.model("User", userSchema);

// module.exports = User;

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
    type: String,
  },
  gender: {
    type: String,
    enum: ["Nam", "Nữ", "Khác"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
  refreshToken: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

// Thêm Virtual Field để liên kết với Order
userSchema.virtual("orders", {
  ref: "Order", // Liên kết tới collection Order
  localField: "_id", // Khóa từ User
  foreignField: "userId", // Khóa từ Order
});

// Tính toán tổng số tiền đã chi tiêu
userSchema.methods.calculateTotalSpent = async function () {
  const orders = await mongoose.model("Order").aggregate([
    {
      $match: {
        userId: this._id, // Chỉ lấy đơn hàng của người dùng hiện tại
        $or: [
          { paymentStatus: "Đã thanh toán" }, // Lọc điều kiện
          { orderStatus: "Giao hàng thành công" },
        ],
      },
    },
    {
      $group: {
        _id: "$userId", // Gom nhóm theo userId
        totalSpent: { $sum: "$totalAmount" }, // Tính tổng totalAmount
      },
    },
  ]);

  return orders.length > 0 ? orders[0].totalSpent : 0;
};

// Tạo model từ schema
const User = mongoose.model("User", userSchema);

module.exports = User;
