const express = require("express");
const { connectToDatabase } = require("./config/mongo");

const productRoutes = require("./routes/product.route");
const adminRoutes = require("./routes/Admin/admin.products.route");
const authRoutes = require("./routes/Auth/auth.route");

const passport = require("passport");
const cors = require("cors");

const cookieParser = require("cookie-parser");

const User = require("./models/User/userModel");
const Order = require("./models/Order/OrderModel");

const {
  handlePayment,
  handleTransaction,
  handleCallback,
} = require("./controllers/payment/payment.controller");

const authMiddleare = require("./middleware/auth.middleare");
const { updateUserRefreshToken } = require("./service/loginRegisterService");
const passportLocal = require("./passports/passport.local");
const passportGoogle = require("./passports/passport.google");
const jwt = require("jsonwebtoken");

const { checkUserJWT } = require("./middleware/JWTAction");

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
// configSession(app);
// passport.use("local", passportLocal);
passport.use("google", passportGoogle);

// TEST
// app.post("/api/v1/testlogin", (req, res, next) => {
//   passport.authenticate("local", { session: false }, (err, user, info) => {
//     if (err) {
//       return res.status(500).json({
//         status: "Thất bại khi xác thực",
//         message: "Có lỗi xảy ra trong quá trình xác thực",
//         error: err,
//       });
//     }

//     if (!user) {
//       return res.status(401).json({
//         status: "Thất bại đăng nhập",
//         message: info ? info.message : "Đăng nhập không thành công",
//       });
//     }
//     console.log("TEST USER:", user);

//     return res.json({
//       status: "Success",
//       message: "Đăng nhập thành công",
//       user,
//     });
//   })(req, res, next);
// });

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
      console.log("ĐÂY LÀ THÔNG TIN ID: ", user.id);
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
// app.post("/verify-token", async (req, res) => {
//   try {
//     // Validate domain

//     // return jwt, refresh token
//     // Save refresh token to database
//     console.log("data:", req.user);
//     const ssoToken = req.body.responseData;
//     // Kiểm tra ssoToken

//     if (req.user && req.user.code === ssoToken) {
//       const refreshToken = uuidv4();

//       // update User
//       await updateUserRefreshToken(req.user.email, refreshToken);

//       let payload = {
//         email: req.user.email,
//         username: req.user.username,
//       };

//       let token = createJWT(payload);

//       // Set cookies
//       res.cookie("access_token", token, {
//         maxAge: 30 * 1000,
//         httpOnly: true,
//       });
//       res.cookie("refresh_token", refreshToken, {
//         maxAge: 90 * 1000,
//         httpOnly: true,
//       });

//       const resData = {
//         access_token: token,
//         refresh_token: refreshToken,
//         email: req.user.email,
//         username: req.user.username,
//       };
//       // Hủy session
//       req.session.destroy(function (err) {
//         console.log("Đã hủy session");
//       });

//       return res.status(200).json({
//         message: "Xác thực token thành công",
//         data: resData,
//       });
//     } else {
//       return res.status(401).json({
//         message: "Xác thực token thất bại",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       message: "Lỗi server khi xác thực token thất bại",
//     });
//   }
// });

///////////////////////////// Route sử dụng thực tế

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/admin/products", adminRoutes);

// ROUTE TEST USER_CONTROLLER
app.use("/api/v1/user", authRoutes);

// ////////////// ROUTER TEST ORDER
app.post("/api/v1/order-payment", checkUserJWT, handlePayment);

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

app.post("/api/v1/callback", handleCallback);

app.post("/api/v1/transaction-status", handleTransaction);

app.listen(3000, async () => {
  console.log("Server is running on http://localhost:" + 3000);
  try {
    connectToDatabase();
  } catch (error) {
    console.error("Không thể kết nối tới Ngrok:", error);
  }
});
