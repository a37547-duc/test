const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  //   user: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //     required: true,
  //   }, // Thông tin người dùng đã đặt hàng

  email: {
    type: String,
    required: true,
  },

  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariantBase",
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

  // City: thành phố, District: quận, huyện, Ward: Xã/ Phường
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
    enum: ["Thanh toán khi nhận hàng", "PayOs"],
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
