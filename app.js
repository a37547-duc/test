const express = require("express");
const { connectToDatabase } = require("./config/mongo");

const productRoutes = require("./routes/product.route");
const adminRoutes = require("./routes/Admin/admin.products.route");
const authRoutes = require("./routes/Auth/auth.route");
const adminUsersRoutes = require("./routes/Admin/admin.users.route");

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

passport.use("google", passportGoogle);

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
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

app.get(
  "/google/redirect",
  passport.authenticate("google", { session: false }),
  function (req, res) {
    console.log("THÔNG TIN TRẢ VỀ:", req.user);
    const token = req.user.data.token;
    const username = req.user.data.username;
    const email = req.user.data.email;

    res.redirect(
      `http://localhost:5173?token=${encodeURIComponent(
        token
      )}&username=${encodeURIComponent(username)}&email=${encodeURIComponent(
        email
      )}`
    );
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

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/admin/products", adminRoutes);
app.use("/api/v1/admin/users", adminUsersRoutes);

// ROUTE USER
app.use("/api/v1/user", authRoutes);

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

// app.post("/api/v1/callback", handleCallback);

app.post("/api/v1/transaction-status", handleTransaction);

app.listen(3000, async () => {
  console.log("Server is running on http://localhost:" + 3000);
  try {
    connectToDatabase();
  } catch (error) {
    console.error("Không thể kết nối tới Ngrok:", error);
  }
});
