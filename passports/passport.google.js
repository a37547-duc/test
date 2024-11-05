// const GoogleStrategy = require("passport-google-oauth2").Strategy;

// module.exports = new GoogleStrategy(
//   {
//     clientID:
//       "1099081057273-2gl1202kcuhjogkrakh16ci5nk7hgvog.apps.googleusercontent.com",
//     clientSecret: "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",
//     callbackURL: "http://localhost:3000/google/callback",
//     passReqToCallback: true,
//     scope: ["profile", "email"],
//   },
//   function (request, accessToken, refreshToken, profile, done) {
//     console.log(profile);
//     //  CẦN BỔ SUNG KẾT NỐI DB
//     done(null, {});
//   }
// );

const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/User/userModel"); // Đảm bảo bạn đã import User model

module.exports = new GoogleStrategy(
  {
    clientID:
      "1099081057273-2gl1202kcuhjogkrakh16ci5nk7hgvog.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/google/callback",
    passReqToCallback: true,
    scope: ["profile", "email"],
  },
  async function (request, accessToken, refreshToken, profile, done) {
    try {
      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await User.findOne({
        email: profile.emails[0].value,
      });

      if (existingUser) {
        // Nếu email đã tồn tại, kiểm tra nếu tài khoản chưa liên kết với Google
        if (!existingUser.googleId) {
          // Cập nhật tài khoản với googleId
          existingUser.googleId = profile.id;
          await existingUser.save();
        }
        // Trả về người dùng đã tồn tại
        return done(null, existingUser);
      } else {
        // Nếu không tồn tại, tạo tài khoản mới
        const newUser = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
        });
        await newUser.save();
        return done(null, newUser);
      }
    } catch (error) {
      return done(error, null);
    }
  }
);
