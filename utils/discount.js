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

async function checkDiscount(userId, cartTotal) {
  // Kiểm tra đầu vào
  if (!userId || cartTotal <= 0) {
    throw new Error("Invalid input: userId or cartTotal");
  }

  // Tìm người dùng
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Tính tổng chi tiêu của người dùng
  const totalSpent = await user.calculateTotalSpent();

  // Lấy danh sách các hạng
  const tiers = await Tier.find({}).sort({ minSpent: -1 }); // Sắp xếp theo mức tiền giảm dần
  if (!tiers || tiers.length === 0) {
    throw new Error("No tiers found");
  }

  // Xác định hạng của người dùng
  const userTier = tiers.find((tier) => totalSpent >= tier.minSpent);

  if (userTier) {
    const discountValue =
      userTier.discountType === "percentage"
        ? (cartTotal * userTier.discountValue) / 100
        : userTier.discountValue;

    return {
      isEligible: true,
      discount: discountValue,
      tier: userTier.name,
      finalPrice: Math.max(cartTotal - discountValue, 0), // Không để giá trị âm
    };
  }

  // Trường hợp không đủ điều kiện giảm giá
  return {
    isEligible: false,
    discount: 0,
    tier: null,
    finalPrice: cartTotal,
  };
}

module.exports = {
  calculateDiscount,
  checkDiscount,
};
