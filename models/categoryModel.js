const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Hình ảnh chuyên mục là bắt buộc"],
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

// Middleware kiểm tra unique trước khi lưu
categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    const existingCategory = await mongoose.models.Category.findOne({
      name: this.name,
      deleted: false, // Chỉ kiểm tra các tài liệu chưa bị xóa mềm
    });

    if (existingCategory) {
      throw new Error("Tên danh mục đã tồn tại");
    }
  }
  next();
});

categorySchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate().$set || this.getUpdate(); // Lấy dữ liệu cập nhật

    // Nếu `name` được cập nhật, kiểm tra tính unique
    if (update.name) {
      const existingBrand = await mongoose.models.Category.findOne({
        name: update.name,
        deleted: false, // Chỉ kiểm tra các thương hiệu chưa bị xóa mềm
        _id: { $ne: this.getQuery()._id }, // Loại trừ chính tài liệu đang cập nhật
      });

      if (existingBrand) {
        const error = new Error("Tên danh mục đã tồn tại");
        error.status = 400; // Gắn mã lỗi 400
        return next(error);
      }
    }
    next();
  } catch (error) {
    next(error); // Truyền lỗi xuống trình xử lý lỗi
  }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
