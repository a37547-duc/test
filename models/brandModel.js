const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      index: true,
      required: [true, "Tên thương hiệu là bắt buộc"],
    },
    image: {
      type: String,
      required: [true, "Hình ảnh thương hiệu là bắt buộc"],
    },
    deleted: {
      type: Boolean,
      default: false, // Đánh dấu xóa mềm, mặc định là chưa xóa
    },
    isHardDeleted: {
      type: Boolean,
      default: false, // Xác định xem thương hiệu đã bị xóa cứng chưa
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
