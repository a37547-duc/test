const User = require("../../models/User/userModel");

// Hàm lấy danh sách người dùng
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "Danh sách người dùng",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Export hàm
module.exports = { getUsers };
