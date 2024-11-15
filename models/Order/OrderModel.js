const mongoose = require("mongoose");
const moment = require("moment");

const orderSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingInfo: {
      fullName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      district: { type: String, required: true },
      city: { type: String, required: true },
      ward: { type: String, required: true },
      address: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["Thanh toán khi nhận hàng", "MoMo"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Chưa thanh toán", "Đã thanh toán", "Thất bại"],
      default: "Chưa thanh toán",
    },
    orderStatus: {
      type: String,
      enum: [
        "Chờ xác nhận",
        "Đã xác nhận",
        "Đã giao hàng",
        "Giao hàng thành công",
        "Đã hủy",
      ],
      default: "Chờ xác nhận",
    },
    orderDate: {
      type: Date,
      default: Date.now,
      get: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    deliveryDate: {
      type: Date,
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
