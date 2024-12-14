const User = require("../models/User/userModel");
const Tier = require("../models/Member-benefits/tierModel");

const calculateDiscount = async (userId, orderAmount) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User không tồn tại");

    // Tính toán totalSpent động
    const totalSpent = await user.calculateTotalSpent();

    // Lấy danh sách các hạng
    const tiers = await Tier.find().sort({ minSpent: -1 }); // Sắp xếp giảm dần theo minSpent

    console.log();
    // Tìm hạng phù hợp với totalSpent
    const matchedTier = tiers.find((tier) => totalSpent >= tier.minSpent) || {
      discountValue: 0,
    };

    // Tính toán giảm giá
    const discount = matchedTier.discountValue
      ? matchedTier.discountType === "percentage"
        ? (orderAmount * matchedTier.discountValue) / 100 // Giảm giá theo %
        : matchedTier.discountValue // Giảm giá cố định
      : 0;

    const finalAmount = Math.max(orderAmount - discount, 0); // Không cho phép giá trị âm

    return {
      discountValue: matchedTier.discountValue,
      finalAmount,
      matchedTier: matchedTier.name || "Bronze",
    };
  } catch (error) {
    console.error("Lỗi khi tính toán giảm giá:", error.message);
    throw error;
  }
};

module.exports = {
  calculateDiscount,
};
