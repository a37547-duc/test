const User = require("../models/User/userModel");
const bcrypt = require("bcrypt");
const { createJWT } = require("../middleware/JWTAction");

const { v4: uuidv4 } = require("uuid");
uuidv4();

const checkPassword = (inputPassword, hashPassword) => {
  return bcrypt.compareSync(inputPassword, hashPassword); // Trả về True / False
};

const handleUserLogin = async (rawData) => {
  try {
    const user = await User.findOne({ email: rawData.email });
    if (!user) {
      return { message: "Tài khoản không tồn tại" };
    }

    const isCorrectPassword = checkPassword(rawData.password, user.password);
    if (!isCorrectPassword) {
      return { message: "Mật khẩu không chính xác", err: "password" };
    }

    // Chỉnh sửa lại để chỉ gửi jwt đi
    const token = createJWT({ id: user._id });
    console.log(user._id);
    return {
      data: {
        token: token,
        email: user.email,
        username: user.username,
      },
      message: "Đăng nhập thành công",
    };
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return { message: "Có lỗi xảy ra trong quá trình đăng nhập" };
  }
};

const updateUserRefreshToken = async (email, token) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { refreshToken: token },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error updating refresh token:", error);
  }
};

module.exports = {
  handleUserLogin,
  updateUserRefreshToken,
};
