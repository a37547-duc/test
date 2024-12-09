const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Liên kết với bảng User (nếu cần)
    ref: "User", // Tên collection liên quan
    required: false, // Để trống nếu là thông báo chung
  },
  type: {
    type: String, // Loại thông báo (e.g., "info", "warning", "error")
    required: true,
    enum: ["info", "success", "error", "warning"], // Các loại hợp lệ
  },
  title: {
    type: String, // Tiêu đề thông báo
    required: true,
  },
  message: {
    type: String, // Nội dung thông báo
    required: true,
  },
  isRead: {
    type: Boolean, // Trạng thái đã đọc
    default: false,
  },
  createdAt: {
    type: Date, // Thời gian tạo thông báo
    default: Date.now,
  },
  readAt: {
    type: Date, // Thời gian người dùng đọc thông báo
    default: null,
  },
  data: {
    type: Object, // Dữ liệu bổ sung liên quan đến thông báo
    default: {},
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
