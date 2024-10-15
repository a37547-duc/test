const mongoose = require("mongoose");
const moment = require("moment");
const Category = require("../models/categoryModel");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxlength: [100, "Product name cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true,
    maxlength: [500, "Product description cannot exceed 500 characters"],
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category is required"],
  },

  use_case_ids: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UseCase",
    required: true,
  },

  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: [true, "Brand is required"],
  },
  images: { type: [String], required: true },
  status: {
    type: String,
    enum: ["available", "out of stock", "discontinued"],
    default: "available",
  },
  createdAt: {
    type: String,
    default: moment().format("DD/MM/YYYY HH[h]/mm[p]/ss[s]"),
  },
  updatedAt: {
    type: String,
    default: moment().format("DD/MM/YYYY HH[h]/mm[p]/ss[s]"),
  },
  type: {
    type: String, // Thêm trường type vào schema
    enum: ["LaptopVariant", "MouseVariant"],
  },
});

productSchema.pre("save", async function (next) {
  console.log("Middleware đã kích hoạt");

  if (!this.category) {
    console.log("Category is required");
    return next(new Error("Category bắt buộc phải có"));
  }

  try {
    const category = await Category.findById(this.category);
    console.log("Category đã tìm thấy:", category);

    if (!category) {
      return next(new Error("Category không tìm thấy"));
    }

    if (category.name.toLowerCase() === "laptop") {
      this.type = "LaptopVariant";
    } else if (category.name.toLowerCase() === "mouse") {
      this.type = "MouseVariant";
    } else {
      console.log("Invalid category name:", category.name);
      return next(new Error("Invalid category name"));
    }

    next(); // Tiếp tục quá trình lưu
  } catch (error) {
    console.error("middleware xảy ra lỗi:", error);
    next(error); // Gửi lỗi nếu xảy ra
  }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
