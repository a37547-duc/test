const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  //   user: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //     required: true,
  //   }, // Thông tin người dùng đã đặt hàng

  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
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

  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },

  paymentMethod: {
    type: String,
    enum: ["Thanh toán khi nhận hàng ", "PayOs"],
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
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
  }, // Ngày đặt hàng

  deliveryDate: {
    type: Date,
  },
}); // Ngày giao hàng

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
