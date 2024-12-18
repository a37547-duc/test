const mongoose = require("mongoose");
const moment = require("moment-timezone");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    discount: { type: Number, default: 0 }, // Giá trị giảm giá áp dụng
    finalAmount: { type: Number, required: true }, // Số tiền cuối cùng sau khi giảm giá

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
      get: (date) =>
        moment(date)
          .tz("Asia/Ho_Chi_Minh")
          .locale("vi")
          .format("DD MMMM, YYYY HH:mm"),
    },
    deliveryDate: {
      type: Date,
      get: (date) =>
        date
          ? moment(date)
              .tz("Asia/Ho_Chi_Minh")
              .locale("vi")
              .format("DD MMMM, YYYY HH:mm")
          : null,
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
