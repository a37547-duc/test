const User = require("../../models/User/userModel");

const getUserAccount = async (req, res) => {
  try {
    // Kiểm tra xem có user trong req.user không
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng.",
      });
    }

    // Tìm người dùng trong cơ sở dữ liệu bằng ID từ req.user
    const userdata = await User.findById({ _id: req.user.id });
    if (!userdata) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng trong cơ sở dữ liệu.",
      });
    }

    // Trả về thông tin người dùng
    return res.status(200).json({
      message: "Lấy thông tin user thành công",
      data: userdata,
    });
  } catch (err) {
    console.error("Lỗi khi lấy thông tin người dùng:", err);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy thông tin người dùng.",
      error: err.message,
    });
  }
};

module.exports = {
  getUserAccount,
};
