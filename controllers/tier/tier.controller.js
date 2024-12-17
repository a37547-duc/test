const Tier = require("../../models/Member-benefits/tierModel");

const getAllTier = async (req, res) => {
  try {
    // Lấy toàn bộ dữ liệu từ Tier collection
    const tiers = await Tier.find();

    // Kiểm tra nếu không có dữ liệu trong cơ sở dữ liệu
    if (!tiers || tiers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tiers found",
      });
    }

    res.status(200).json({
      success: true,
      data: tiers,
    });
  } catch (error) {
    console.error("Error fetching tiers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tiers",
      error: error.message,
    });
  }
};

const updateTier = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL
    const updates = req.body; // Lấy dữ liệu cập nhật từ body của request

    // Tìm và cập nhật tài liệu
    const updatedTier = await Tier.findByIdAndUpdate(id, updates, {
      new: true, // Trả về tài liệu sau khi được cập nhật
      runValidators: true, // Chạy các trình xác thực trong schema
    });

    // Kiểm tra nếu không tìm thấy tài liệu
    if (!updatedTier) {
      return res.status(404).json({
        success: false,
        message: "Tier not found",
      });
    }

    // Trả về phản hồi khi cập nhật thành công
    res.status(200).json({
      success: true,
      message: "Tier updated successfully",
      data: updatedTier,
    });
  } catch (error) {
    // Xử lý lỗi
    console.error("Error updating tier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tier",
      error: error.message,
    });
  }
};

// Hàm xóa Tier theo tierId
const deleteTier = async (req, res) => {
  try {
    const { tierId } = req.params;

    // Tìm và xóa Tier theo ID
    const deletedTier = await Tier.findByIdAndDelete(tierId);

    // Nếu không tìm thấy Tier
    if (!deletedTier) {
      return res.status(404).json({
        success: false,
        message: "Tier không tồn tại.",
      });
    }

    // Phản hồi nếu xóa thành công
    res.status(200).json({
      success: true,
      message: "Tier đã được xóa thành công.",
      data: deletedTier,
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xóa Tier.",
      error: error.message,
    });
  }
};

// Hàm tạo Tier mới
const createTier = async (req, res) => {
  try {
    const {
      name,
      minSpent,
      discountValue,
      discountType,
      description,
      couponExpiryDays,
      otherBenefits,
      color,
    } = req.body;

    // Kiểm tra nếu `name` đã tồn tại
    const existingTier = await Tier.findOne({ name });
    if (existingTier) {
      return res.status(400).json({ message: "Tier với tên này đã tồn tại." });
    }

    // Tạo mới Tier
    const tier = new Tier({
      name,
      minSpent,
      discountValue,
      discountType,
      description,
      couponExpiryDays,
      otherBenefits,
      color,
    });

    await tier.save();

    // Phản hồi thành công
    res.status(201).json({ message: "Tạo Tier thành công", data: tier });
  } catch (error) {
    // Xử lý lỗi
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};
module.exports = { getAllTier, updateTier, deleteTier, createTier };
