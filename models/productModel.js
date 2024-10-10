const mongoose = require("mongoose");
const moment = require("moment");

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
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
