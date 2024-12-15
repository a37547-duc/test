const User = require("../../models/User/userModel"); // Import model User
const Tier = require("../../models/Member-benefits/tierModel"); // Import model Tier

// Hàm lấy thông tin tier cho người dùng
const getUserTier = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.user.id });
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng.",
      });
    }

    // Tính toán tổng chi tiêu của người dùng
    const totalSpent = await user.calculateTotalSpent();

    // Lấy danh sách tier, sắp xếp theo `minSpent` tăng dần
    const tiers = await Tier.find().sort({ minSpent: 1 });

    // Tìm hạng phù hợp với `totalSpent`
    const matchedTier =
      tiers.find((tier) => totalSpent >= tier.minSpent) || null;

    // Trả về thông tin tier
    res.status(200).json({
      message: "Lấy thông tin hạng người dùng thành công",
      data: {
        userId: req.user.id,
        username: user.username,
        totalSpent,
        tier: matchedTier ? matchedTier.name : "Bronze", // Mặc định là Bronze
        tiers,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

module.exports = {
  getUserTier,
};
