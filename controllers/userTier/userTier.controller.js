const User = require("../../models/User/userModel"); // Import model User
const Tier = require("../../models/Member-benefits/tierModel"); // Import model Tier
const { checkDiscount } = require("../../utils/discount");

// Hàm lấy thông tin tier cho người dùng
// const getUserTier = async (req, res) => {
//   try {
//     const user = await User.findById({ _id: req.user.id });
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         message: "Không tìm thấy thông tin người dùng.",
//       });
//     }

//     // Tính toán tổng chi tiêu của người dùng
//     const totalSpent = await user.calculateTotalSpent();

//     // Lấy danh sách tier, sắp xếp theo `minSpent` tăng dần
//     const tiers = await Tier.find().sort({ minSpent: 1 });
//     console.log("DANH SÁCH HẠNG: ", tiers);
//     // Tìm hạng phù hợp với `totalSpent`
//     const matchedTier =
//       tiers.find((tier) => totalSpent >= tier.minSpent) || null;
//     console.log("Số tiền đã tiêu: ", totalSpent);
//     console.log("Hạng người dùng là: ", matchedTier);
//     // Trả về thông tin tier
//     res.status(200).json({
//       message: "Lấy thông tin hạng người dùng thành công",
//       data: {
//         userId: req.user.id,
//         username: user.username,
//         totalSpent,
//         tier: matchedTier ? matchedTier.name : "Bronze", // Mặc định là Bronze
//         tiers,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
//   }
// };

const getUserTier = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng.",
      });
    }

    const user = await User.findById({ _id: req.user.id });

    // Tính toán tổng chi tiêu của người dùng
    const totalSpent = parseFloat(await user.calculateTotalSpent());

    // Lấy danh sách tier, sắp xếp theo `minSpent` tăng dần
    let tiers = await Tier.find();
    tiers = tiers.sort((a, b) => a.minSpent - b.minSpent); // Đảm bảo sắp xếp chính xác

    console.log("DANH SÁCH HẠNG: ", tiers);
    console.log("Số tiền đã tiêu: ", totalSpent);

    // Tìm hạng phù hợp với `totalSpent`
    const matchedTier = tiers.reduce((currentTier, tier) => {
      return totalSpent >= tier.minSpent ? tier : currentTier;
    }, null);

    console.log("Hạng người dùng là: ", matchedTier);

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
    console.error(error); // Ghi log lỗi để kiểm tra
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// const handleDiscountCheck = async (req, res) => {
//   try {
//     const { cartTotal, isApplied } = req.body;
//     // Nếu `isApplied` là true, bỏ giảm giá
//     if (isApplied === true) {
//       return {
//         isApplied: false,
//         discount: 0,
//         finalPrice: cartTotal,
//         message: "Đã bỏ áp dụng giảm giá.",
//       };
//     }

//     // Gọi hàm kiểm tra điều kiện áp dụng giảm giá
//     const discountInfo = await checkDiscount(req.user.id, cartTotal);

//     if (discountInfo && discountInfo.isEligible) {
//       // Nếu đủ điều kiện
//       return {
//         isApplied: true,
//         discount: discountInfo.discount, // % giảm giá
//         finalPrice: discountInfo.finalPrice, // Giá sau khi giảm
//         message: "Áp dụng giảm giá thành công.",
//       };
//     } else {
//       // Không đủ điều kiện
//       return {
//         isApplied: false,
//         discount: 0,
//         finalPrice: cartTotal,
//         message: "Không đủ điều kiện áp dụng giảm giá.",
//       };
//     }
//   } catch (err) {
//     console.error("Lỗi kiểm tra giảm giá:", err);
//     throw new Error("Đã xảy ra lỗi khi kiểm tra giảm giá.");
//   }
// };

const handleDiscountCheck = async (req, res) => {
  try {
    const { cartTotal, isApplied } = req.body;

    // Nếu `isApplied` là true, bỏ giảm giá
    if (isApplied === true) {
      return res.status(200).json({
        isApplied: false,
        discount: 0,
        finalPrice: cartTotal,
        message: "Đã bỏ áp dụng giảm giá.",
      });
    }
    console.log(req.user.id);
    // Gọi hàm kiểm tra điều kiện áp dụng giảm giá
    const discountInfo = await checkDiscount(req.user.id, cartTotal);

    if (discountInfo && discountInfo.isEligible) {
      // Nếu đủ điều kiện
      return res.status(200).json({
        isApplied: true,
        discount: discountInfo.discount, // % giảm giá
        finalPrice: discountInfo.finalPrice, // Giá sau khi giảm
        message: "Áp dụng giảm giá thành công.",
      });
    } else {
      // Không đủ điều kiện
      return res.status(200).json({
        isApplied: false,
        discount: 0,
        finalPrice: cartTotal,
        message: "Không đủ điều kiện áp dụng giảm giá.",
      });
    }
  } catch (err) {
    console.error("Lỗi kiểm tra giảm giá:", err);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi kiểm tra giảm giá.",
      error: err.message,
    });
  }
};

module.exports = {
  getUserTier,
  handleDiscountCheck,
};
