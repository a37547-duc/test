const express = require("express");
const { connectToDatabase } = require("./config/mongo");

const productRoutes = require("./routes/product.route");
const adminRoutes = require("./routes/Admin/admin.products.route");
const authRoutes = require("./routes/Auth/auth.route");
const adminUsersRoutes = require("./routes/Admin/admin.users.route");
const adminOrdersRoutes = require("./routes/Admin/admin.orders.route");
const ratingRoutes = require("./routes/Rating/rating.route");
const tierRoutes = require("./routes/Admin/admin.tier.route");

const userTierRoutes = require("./routes/Auth/userTier.route");
const passport = require("passport");
const cors = require("cors");

const cookieParser = require("cookie-parser");

const User = require("./models/User/userModel");
const Order = require("./models/Order/OrderModel");
const Rating = require("./models/Ratings/ratingModel");
const Product = require("./models/productModel");

const Tier = require("./models/Member-benefits/tierModel");

const {
  handlePayment,
  handleTransaction,
  handleCallback,
} = require("./controllers/payment/payment.controller");

const authMiddleare = require("./middleware/auth.middleare");
const passportLocal = require("./passports/passport.local");
const passportGoogle = require("./passports/passport.google");
const jwt = require("jsonwebtoken");

const { checkDiscount } = require("./utils/discount");

// SOCKET IO
const { createServer } = require("http"); // Tạo HTTP server

const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Cấu hình cors
require("./jobs/deleteOldRecords");

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
app.get("/health", (req, res) => {
  res.status(200).send("Health check OK");
});

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

app.use("/api/v1/admin/orders", adminOrdersRoutes);
// ROUTE USER
app.use("/api/v1/user", authRoutes);

// ROUTE RATING
app.use("/api/v1/rating", ratingRoutes);

app.post("/api/v1/transaction-status", handleTransaction);

// ROUTE TIER
app.use("/api/v1/admin/tiers", tierRoutes);

app.use("/api/v1/user/tier", userTierRoutes);

//
app.get("/api/v1/ratings/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra tính hợp lệ của productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId.",
      });
    }

    // Sử dụng Aggregation Pipeline để tính toán và lấy dữ liệu
    const results = await Rating.aggregate([
      // Bước 1: Lọc theo productId
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },

      // Bước 2: Gom nhóm theo rating và đếm số lượng
      {
        $group: {
          _id: "$rating", // Gom nhóm theo giá trị rating
          count: { $sum: 1 }, // Đếm số lượng mỗi nhóm
        },
      },

      // Bước 3: Sắp xếp theo thứ tự rating tăng dần (1, 2, 3, ...)
      { $sort: { _id: 1 } },
    ]);

    // Lấy danh sách đánh giá chi tiết và thêm thông tin từ User
    const ratings = await Rating.find({ productId }).populate(
      "userId",
      "username"
    );

    // Chuyển kết quả từ Aggregation thành cấu trúc dễ đọc
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    results.forEach((item) => {
      starCounts[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      message: "Ratings fetched successfully.",
      data: {
        totalRatings: ratings.length,
        starCounts,
        ratings, // Danh sách các đánh giá chi tiết (bao gồm username)
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the ratings.",
      error: error.message,
    });
  }
});

app.post("/tier/create", async (req, res) => {
  try {
    const {
      name,
      minSpent,
      discountValue,
      discountType,
      description,
      couponExpiryDays,
      otherBenefits,
    } = req.body;

    // Kiểm tra nếu `name` đã tồn tại
    const existingTier = await Tier.findOne({ name });
    if (existingTier) {
      return res.status(400).json({ message: "Tier với tên này đã tồn tại." });
    }

    // Tạo mới Tier
    const tier = new Tier({
      name,
      minSpent,
      discountValue,
      discountType,
      couponExpiryDays,
      description,
      otherBenefits,
    });

    await tier.save();
    res.status(201).json({ message: "Tạo Tier thành công", data: tier });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
});

app.get("/user/:userId/total-spent", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalSpent = await user.calculateTotalSpent();
    res.status(200).json({ username: user.username, totalSpent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/:userId/tier", async (req, res) => {
  try {
    const { userId } = req.params;

    // Lấy thông tin người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Tính toán totalSpent động bằng calculateTotalSpent
    const totalSpent = await user.calculateTotalSpent();

    // Lấy danh sách hạng
    const tiers = await Tier.find().sort({ minSpent: 1 }); // Sắp xếp giảm dần theo minSpent

    // Tìm hạng phù hợp với totalSpent
    const matchedTier =
      tiers.find((tier) => totalSpent >= tier.minSpent) || null;

    // Trả về hạng
    res.status(200).json({
      message: "Lấy thông tin hạng người dùng thành công",
      data: {
        userId: user._id,
        username: user.username,
        totalSpent,
        tier: matchedTier ? matchedTier.name : "Bronze", // Mặc định là Bronze nếu không có hạng phù hợp
        tiers,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
});

app.post("/check-discount", async (req, res) => {
  const { userId, cartTotal } = req.body;

  try {
    // Gọi hàm checkDiscount để xử lý logic
    const discountInfo = await checkDiscount(userId, cartTotal);

    // Trả về kết quả nếu cần xử lý thêm (không xử lý trực tiếp trong checkDiscount)
    res.status(200).json(discountInfo);
  } catch (err) {
    console.error("Lỗi kiểm tra giảm giá:", err);
    res
      .status(500)
      .json({ message: "Lỗi kiểm tra giảm giá", error: err.message });
  }
});

app.listen(3000, async () => {
  console.log("Server is running on http://localhost:" + 3000);
  try {
    connectToDatabase();
  } catch (error) {
    console.error("Không thể kết nối tới Ngrok:", error);
  }
});
