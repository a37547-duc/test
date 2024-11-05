// const LocalStrategy = require("passport-local").Strategy;
// const User = require("../models/User/userModel");
// const bcrypt = require("bcrypt");
// const { find } = require("../models/categoryModel");

// module.exports = new LocalStrategy(
//   {
//     usernameField: "email",
//     passwordField: "password",
//   },
//   async (email, password, done) => {
//     const user = await User.findOne({
//       email: email,
//       password: password,
//     });
//     if (!user) {
//       return done(null, false, {
//         message: "Tài khoản không tồn tại",
//       });
//     }
//     if (!bcrypt.compareSync(password, user.password)) {
//       return done(null, false, {
//         message: "Mật khẩu không hợp lệ",
//       });
//     }
//     return done(null, user);
//   }
// );

const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User/userModel");
const bcrypt = require("bcrypt");

const loginRegisterService = require("../service/loginRegisterService");

const { v4: uuidv4 } = require("uuid");
uuidv4();

module.exports = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (req, email, password, done) => {
    try {
      const user = await loginRegisterService.handleUserLogin({
        email,
        password,
      });

      if (!user) {
        console.log("Không tìm thấy người dùng!");
        return done(null, false, {
          message: "Email hoặc mật khẩu không đúng.",
          err: "email",
        });
      }
      console.log(user);
      return done(null, user);
    } catch (err) {
      console.error("Đã xảy ra lỗi khi đăng nhập:", err);
      return done(err);
    }
  }
);
