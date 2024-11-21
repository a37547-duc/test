const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Tên thương hiệu là bắt buộc"],
    },
    image: {
      type: String,
      required: [true, "Hình ảnh thương hiệu là bắt buộc"],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    isHardDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware kiểm tra unique trước khi lưu
brandSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    const existingBrand = await mongoose.models.Brand.findOne({
      name: this.name,
      deleted: false, // Chỉ kiểm tra các tài liệu chưa bị xóa mềm
    });

    if (existingBrand) {
      throw new Error("Tên danh mục đã tồn tại");
    }
  }
  next();
});

// brandSchema.pre("findOneAndUpdate", async function (next) {
//   try {
//     const update = this.getUpdate().$set || this.getUpdate(); // Lấy dữ liệu cập nhật

//     // Nếu `name` được cập nhật, kiểm tra tính unique
//     if (update.name) {
//       const existingBrand = await mongoose.models.Brand.findOne({
//         name: update.name,
//         deleted: false, // Chỉ kiểm tra các thương hiệu chưa bị xóa mềm
//         _id: { $ne: this.getQuery()._id }, // Loại trừ chính tài liệu đang cập nhật
//       });

//       if (existingBrand) {
//         return next(new Error("Tên thương hiệu đã tồn tại"));
//       }
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

brandSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate().$set || this.getUpdate(); // Lấy dữ liệu cập nhật

    // Nếu `name` được cập nhật, kiểm tra tính unique
    if (update.name) {
      const existingBrand = await mongoose.models.Brand.findOne({
        name: update.name,
        deleted: false, // Chỉ kiểm tra các thương hiệu chưa bị xóa mềm
        _id: { $ne: this.getQuery()._id }, // Loại trừ chính tài liệu đang cập nhật
      });

      if (existingBrand) {
        const error = new Error("Tên thương hiệu đã tồn tại");
        error.status = 400; // Gắn mã lỗi 400
        return next(error);
      }
    }
    next();
  } catch (error) {
    next(error); // Truyền lỗi xuống trình xử lý lỗi
  }
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
