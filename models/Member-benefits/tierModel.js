const mongoose = require("mongoose");

const tierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Bronze", // Giá trị mặc định
  },
  color: {
    type: String,
    required: true,
  },
  minSpent: { type: Number, required: true }, // Tổng chi tiêu tối thiểu để đạt hạng
  discountValue: { type: Number, required: false }, // Giá trị giảm giá (ví dụ: 10, 20, 30)
  description: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage",
  }, // Loại giảm giá
  couponExpiryDays: { type: Number, default: 30 }, // Số ngày coupon có hiệu lực
  otherBenefits: { type: [String], default: [] }, // Các lợi ích khác (ví dụ: giao hàng miễn phí, điểm thưởng)
});

module.exports = mongoose.model("Tier", tierSchema);
