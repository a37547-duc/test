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

    // const data = {
    //   // email: user.email,
    //   // username: user.username,
    //   code: uuidv4(),
    // };
    // const token = createJWT(data);

    const code = uuidv4();
    return {
      data: {
        code: code,
        // access_token: token,
        // email: user.email,
        // username: user.username,
      },
      message: "Đăng nhập thành công",
    };
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return { message: "Có lỗi xảy ra trong quá trình đăng nhập" };
  }
};

module.exports = {
  handleUserLogin,
};
