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

const {
  handlePayment,
  handleTransaction,
  handleCallback,
} = require("./controllers/payment/payment.controller");

const authMiddleare = require("./middleware/auth.middleare");

const passportLocal = require("./passports/passport.local");
const passportGoogle = require("./passports/passport.google");
const jwt = require("jsonwebtoken");
// Cấu hình Ngrok
const ngrok = require("ngrok");
const { setNgrokUrl } = require("./config/ngrok");

const configSession = require("./config/session");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Cấu hình cors
// require("./jobs/deleteOldRecords");

app.use(
  cors({
    // origin: process.env.URL_CLIENT, //
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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

///////////////////////////// Route sử dụng thực tế

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/admin/products", adminRoutes);

// ////////////// ROUTER TEST ORDER
app.post("/api/v1/order-payment", handlePayment);

app.get("/api/v1/order", async (req, res) => {
  try {
    const orders = await Order.find({});
    if (!orders || orders.length == 0) {
      return res.status(404).json({ message: "Không có đơn hàng nào " });
    }
    res.status(200).json({
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error });
  }
});

app.patch("/api/v1/order/:id", async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      {
        new: true,
      }
    );
    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    res.status(200).json({ message: "Thông tin đơn hàng đã cập nhật", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/v1/payment", handlePayment);
app.post("/api/v1/callback", handleCallback);

app.post("/api/v1/transaction-status", handleTransaction);

app.listen(3000, async () => {
  console.log("Server is running on http://localhost:" + 3000);
  try {
    const ngrokUrl = await ngrok.connect(3000);
    setNgrokUrl(ngrokUrl);
    console.log(`Cổng chạy Ngrok: ${ngrokUrl}`);
  } catch (error) {
    console.error("Không thể kết nối tới Ngrok:", error);
  }
  connectToDatabase();
});

// https://0afa-117-5-74-107.ngrok-free.app
