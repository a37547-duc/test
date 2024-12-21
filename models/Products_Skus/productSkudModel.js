// const mongoose = require("mongoose");
// const Product = require("../productModel");

// const productVariantBaseSchema = new mongoose.Schema(
//   {
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//     },
//     color: {
//       type: String,
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     stock_quantity: {
//       type: Number,
//       default: 0,
//       min: [0, "Sản phẩm không được âm"],
//     },
//     deleted: {
//       type: Boolean,
//       default: false, // Mặc định chưa xóa mềm
//     },
//     isHardDeleted: {
//       type: Boolean,
//       default: false, // Mặc định chưa xóa cứng
//     },
//   },
//   { discriminatorKey: "type" }
// );

// const ProductVariantBase = mongoose.model(
//   "ProductVariantBase",
//   productVariantBaseSchema
// );

// // Tạo LaptopVariant sử dụng discriminator
// const laptopVariantSchema = new mongoose.Schema({
//   gpu: {
//     name: {
//       type: String,
//       required: [true, "Cần cung cấp tên GPU"],
//       trim: true,
//     },
//   },
//   cpu: {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     cores: {
//       type: Number,
//       required: true,
//     },
//     threads: {
//       type: Number,
//       required: true,
//     },
//   },
//   storage: {
//     type: String,
//     required: true,
//   },
//   ram: {
//     capacity: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       required: true,
//     },
//   },
// });

// // Tạo model LaptopVariant dựa trên ProductVariantBase
// const LaptopVariant = ProductVariantBase.discriminator(
//   "LaptopVariant", // Tên discriminator
//   laptopVariantSchema
// );

// module.exports = {
//   ProductVariantBase,
//   LaptopVariant, // Xuất cả hai model
// };

const mongoose = require("mongoose");
const Product = require("../productModel");

const productVariantBaseSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    stock_quantity: {
      type: Number,
      default: 0,
      min: [0, "Sản phẩm không được âm"],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    isHardDeleted: {
      type: Boolean,
      default: false,
    },
    // discount: {
    //   type: Number,
    //   default: 0,
    //   min: [0, "Giảm giá không được âm"],
    //   max: [100, "Giảm giá không được vượt quá 100%"],
    // },
    discount: {
      type: Number,
      default: 0,
    },
  },
  {
    discriminatorKey: "type",
    toJSON: { virtuals: true }, // Kích hoạt virtual fields khi chuyển sang JSON
    toObject: { virtuals: true },
  }
);

// Virtual field: Tính giá sau giảm
productVariantBaseSchema.virtual("discountedPrice").get(function () {
  if (this.discount && this.price) {
    return this.price - (this.discount / 100) * this.price;
  }
  return this.price; // Nếu không có giảm giá, trả về giá gốc
});

// productVariantBaseSchema.virtual("discountedPrice").get(function () {
//   if (this._discountValue && this.price) {
//     return this.price - (this.price * this._discountValue) / 100;
//   }
//   return this.price;
// });

const ProductVariantBase = mongoose.model(
  "ProductVariantBase",
  productVariantBaseSchema
);

// Schema cho LaptopVariant
const laptopVariantSchema = new mongoose.Schema({
  gpu: {
    name: {
      type: String,
      required: [true, "Cần cung cấp tên GPU"],
      trim: true,
    },
  },
  cpu: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cores: {
      type: Number,
      required: true,
    },
    threads: {
      type: Number,
      required: true,
    },
  },
  storage: {
    type: String,
    required: true,
  },
  ram: {
    capacity: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
});

// Tạo model LaptopVariant dựa trên ProductVariantBase
const LaptopVariant = ProductVariantBase.discriminator(
  "LaptopVariant",
  laptopVariantSchema
);

module.exports = {
  ProductVariantBase,
  LaptopVariant,
};
