const User = require("../../models/User/userModel");
const Order = require("../../models/Order/OrderModel");
const Token = require("../../models/tokenModel");
const mongoose = require("mongoose");
const { createJWT } = require("../../middleware/JWTAction");
const { sendEmail } = require("../../service/emailService");
//
const bcrypt = require("bcrypt");
const passportLocal = require("../../passports/passport.local");
const passport = require("passport");
passport.use("local", passportLocal);

const authenticateLocal = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    console.log("ĐÂY LÀ THÔNG TIN BÊN USER: ", user);

    if (user.err) {
      return res.status(400).json({
        status: "Thất bại khi xác thực",
        message: user.message,
      });
    }

    if (err) {
      return res.status(500).json({
        status: "Thất bại khi xác thực",
        message: "Có lỗi xảy ra trong quá trình xác thực",
        error: err,
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "Thất bại đăng nhập",
        message: info ? info.message : "Đăng nhập không thành công",
      });
    }

    console.log("TEST USER:", user);

    return res.json({
      message: user.message,
      data: user.data,
    });
  })(req, res, next);
};

const Register = async (req, res) => {
  try {
    const { username, email, authType, password } = req.body;

    const existingUser = await User.findOne({
      email: email,
      authType: authType,
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      email: email,
      authType: authType,
      password: hashedPassword,
    });

    // Khởi tạo token để verify
    const payload = { userId: newUser._id }; // Dữ liệu để mã hóa JWT
    const jwtToken = createJWT(payload);

    const token = new Token({
      userId: newUser._id,
      token: jwtToken,
    });

    await token.save();
    await newUser.save();
    const url = `http://localhost:5173/users/${newUser._id}/verify/${jwtToken}`;

    const data = {
      email: newUser.email,
      url: url,
    };

    await sendEmail(data, "verify");
    res.json({
      message: "Vui lòng kiểm tra email để xác minh tài khoản",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
  }
};

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

const updateUserAccount = async (req, res) => {
  const data = req.body;
  const userId = req.user.id;
  console.log(data);
  try {
    const updateData = await User.findByIdAndUpdate(
      userId,
      {
        $set: data,
      },
      {
        new: true,
      }
    );
    if (!updateData) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng để cập nhật",
      });
    }
    return res.status(200).json({
      message: "Cập nhật thông tin người dùng thành công",
      user: updateData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi không thể cập nhật thông tin người dùng",
      error: err.message,
    });
  }
};

const getUserOrders = async (req, res) => {
  const userId = req.user.id;
  const { status } = req.query;
  console.log("THÔNG TIN QUERY: ", status);
  try {
    let query = { userId: userId };
    if (status) {
      query.orderStatus = status;
    }

    const order = await Order.find(query);

    if (!order || order.length === 200) {
      return res.status(200).json({ message: "Vẫn chưa có đơn hàng nào" });
    }
    return res
      .status(200)
      .json({ message: "Lấy thông tin đơn hàng thành công", data: order });
  } catch (error) {
    return res.status(500).json({
      message: "Xảy ra lỗi khi lấy thông tin đơn hàng",
      error: err.message,
    });
  }
};

const verifyAccount = async (req, res) => {
  try {
    console.log("ID từ params:", req.params.id);
    console.log("Token từ params:", req.params.token);

    // Kiểm tra định dạng ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Tìm người dùng
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).json({ message: "Invalid link" });

    // Kiểm tra nếu người dùng đã xác minh
    if (user.verified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    // Tìm token xác minh
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).json({ message: "Invalid link" });

    // Cập nhật trạng thái xác minh
    await User.updateOne({ _id: user._id }, { $set: { verified: true } });

    // Xóa token sau khi sử dụng
    await Token.deleteOne({ _id: token._id });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  Register,
  verifyAccount,
  //
  getUserAccount,
  updateUserAccount,
  //
  getUserOrders,
  authenticateLocal,
};
