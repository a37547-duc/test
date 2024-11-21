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
      default: false, // Mặc định chưa xóa mềm
    },
    isHardDeleted: {
      type: Boolean,
      default: false, // Mặc định chưa xóa cứng
    },
  },
  { discriminatorKey: "type" }
);

const ProductVariantBase = mongoose.model(
  "ProductVariantBase",
  productVariantBaseSchema
);

// Tạo LaptopVariant sử dụng discriminator
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
  "LaptopVariant", // Tên discriminator
  laptopVariantSchema
);

module.exports = {
  ProductVariantBase,
  LaptopVariant, // Xuất cả hai model
};
