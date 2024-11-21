const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "", // Mô tả danh mục, không bắt buộc
    },
    image: {
      type: String,
      default: "", // URL hình ảnh của danh mục
    },
    deleted: {
      type: Boolean,
      default: false, // Đánh dấu đã xóa mềm
    },
    isHardDeleted: {
      type: Boolean,
      default: false, // Đánh dấu đã xóa cứng (xóa vĩnh viễn)
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
