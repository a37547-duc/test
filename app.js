const express = require("express");
const { connectToDatabase } = require("./config/mongo");

const productRoutes = require("./routes/product.route");
const adminRoutes = require("./routes/Admin/admin.products.route");

const passport = require("passport");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

// ////////////////////////////////
const Category = require("./models/categoryModel");
const Brand = require("./models/brandModel");
const UseCase = require("./models/usecaseModel");
const User = require("./models/User/userModel");
const Order = require("./models/Order/OrderModel");

const authMiddleare = require("./middleware/auth.middleare");

const passportLocal = require("./passports/passport.local");
const passportGoogle = require("./passports/passport.google");
const jwt = require("jsonwebtoken");

const configSession = require("./config/session");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Cấu hình cors
// require("./jobs/deleteOldRecords");

app.use(
  cors({
    // origin: process.env.URL_CLIENT, //  một số domain  cho phép
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// TEST
app.set("trust proxy", 1);

// Cấu hình passport và session
configSession(app);
passport.use("local", passportLocal);
passport.use("google", passportGoogle);

// app.use(passport.initialize());
// app.use(passport.session()); // Không cần thiết

// passport.serializeUser(function (user, done) {
//   done(null, user._id);
// });

// passport.deserializeUser(async function (id, done) {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// TEST
async function generateFakeUser() {
  const email = faker.internet.email();
  const rawPassword = "bacdaibang1897";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const fakeUser = new User({
    username: "dominhduc",
    email: "anhtupeo1234@gmail.com",
    password: hashedPassword, // Lưu mật khẩu đã mã hóa
  });

  return await fakeUser.save(); // Lưu người dùng vào MongoDB
}

// Route /test tạo và trả về người dùng giả
app.get("/test", async (req, res) => {
  try {
    const fakeUser = await generateFakeUser();
    res.json(fakeUser); // Trả về dữ liệu người dùng giả dưới dạng JSON
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
  }
});

app.post("/testlogin", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: "Failed",
        message: "Có lỗi xảy ra trong quá trình xác thực",
        error: err,
      });
    }
    console.log(user);
    if (!user) {
      return res.status(401).json({
        status: "Failed",
        message: info ? info.message : "Đăng nhập không thành công",
      });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({
          status: "Failed",
          message: "Có lỗi xảy ra trong quá trình đăng nhập",
          error: user.message,
        });
      }

      return res.json({
        status: "Success",
        message: "Đăng nhập thành công",
        user,
      });
    });
  })(req, res, next);
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Khong xoa duoc session");
      res.status(500).json({ message: "Logout that bai" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logout thanh cong" });
  });
});

app.get(
  "/google/redirect",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

app.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect(`${process.env.URL_CLIENT}/login-failure`);
      }
      req.user = user;
      console.log("ĐÂY LÀ THÔNG TIN: ", user);
      next();
    })(req, res, next); // Gọi hàm authenticate với các đối số
  },
  (req, res) => {
    res.redirect(`${process.env.URL_CLIENT}/login-success/${req.user?.id}`);
  }
);

app.post("/login-success", async (req, res) => {
  const { id } = req.body;

  try {
    if (!id) {
      return res.status(400).json({
        err: 1,
        message: "Missing inputs",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        err: 2,
        message: "User not found",
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, "hip06", {
      expiresIn: "5h",
    });

    return res.status(200).json({
      err: 0,
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      err: -1,
      message: "Fail at auth controller: " + error.message,
    });
  }
});

// ////////////////// ROUTE TEST ORDER

///////////////////////////// Route sử dụng thực tế

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/admin/products", adminRoutes);

app.post("/api/v1/order", async (req, res) => {
  try {
    const newOrder = new Order(req.body);

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Đơn hàng đã được tạo thành công!",
      order: savedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo đơn hàng.",
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:" + 3000);
  connectToDatabase();
});
