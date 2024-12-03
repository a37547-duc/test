const express = require("express");
const router = express.Router();

const User = require("../../models/User/userModel");

const InvalidToken = require("../../models/invalidTokenModel");

const bcrypt = require("bcrypt");
const {
  handlePayment,
  handleTransaction,
  handleCallback,
} = require("../../controllers/payment/payment.controller");

const {
  Register,
  verifyAccount,
  //
  getUserAccount,
  updateUserAccount,
  //
  authenticateLocal,
  getUserOrders,
} = require("../../controllers/user/user.controller");
////////////////////////

const { sendEmail } = require("../../service/emailService");

const {
  checkUserJWT,
  createJWT,
  verifyToken,
} = require("../../middleware/JWTAction");
const { checkRoles } = require("../../middleware/auth.middleare");

// router.use(checkUserJWT, checkRoles(["admin"]));

router.post("/register", Register); // Đăng ký
router.post("/login", authenticateLocal); // Đăng nhập

router.get("/account", checkUserJWT, checkRoles(["user"]), getUserAccount);

router.patch(
  "/account/update",
  checkUserJWT,
  checkRoles(["user"]),
  updateUserAccount
);

// ROUTE ORDER

router.get("/order", checkUserJWT, checkRoles(["user"]), getUserOrders);

router.post(
  "/order-payment",
  checkUserJWT,
  checkRoles(["user"]),
  handlePayment
);

router.post(
  "/order/callback",

  handleCallback
);

router.get("/:id/verify/:token/", verifyAccount);

router.post("/reset-password", async (req, res) => {
  const { email } = req.body; // Lấy email từ body

  console.log("Thông tin email: ", email);
  // Kiểm tra email có hợp lệ không
  if (!email) {
    return res.status(400).json({ error: "Email không hợp lệ" });
  }
  const payload = { email }; // Payload chứa email người dùng
  const resetToken = createJWT(payload); // Tạo token reset mật khẩu

  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

  // Dữ liệu gửi email
  const emailData = {
    email: email,
    resetLink: resetLink,
  };

  try {
    // Gửi email khôi phục mật khẩu
    await sendEmail(emailData, "reset-password");

    res.status(200).json({ message: "Email khôi phục mật khẩu đã được gửi!" });
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    res.status(500).json({ error: "Đã có lỗi xảy ra khi gửi email!" });
  }
});

router.post("/reset-password/confirm", async (req, res) => {
  const { token, password } = req.body;

  // Kiểm tra xem token và mật khẩu có được gửi lên không
  if (!token || !password) {
    return res
      .status(400)
      .json({ error: "Token và mật khẩu không được để trống" });
  }

  try {
    // Kiểm tra xem token có nằm trong danh sách đen không
    const blacklistedToken = await InvalidToken.findOne({ token });
    if (blacklistedToken) {
      return res.status(400).json({ error: "Token đã bị thu hồi!" });
    }

    // Giải mã token để lấy thông tin người dùng (email)
    const decoded = verifyToken(token);
    const email = decoded.email;

    // Kiểm tra xem người dùng có tồn tại trong cơ sở dữ liệu không
    const user = await User.findOne({ email, authType: "local" });
    if (!user) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu mới cho người dùng
    user.password = hashedPassword;
    await user.save();

    // Thêm token vào danh sách đen (invalidated tokens)
    await InvalidToken.create({ token });

    // Trả về thông báo thành công
    res.status(200).json({ message: "Mật khẩu đã được thay đổi thành công!" });
  } catch (error) {
    // Nếu có lỗi (ví dụ, token không hợp lệ hoặc hết hạn)
    console.error("Lỗi khi thay đổi mật khẩu:", error);
    res.status(400).json({ error: "Token không hợp lệ hoặc đã hết hạn!" });
  }
});

router.post("/change-password", checkUserJWT, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  console.log("Check id người dùng: ", userId);

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc." });
  }

  try {
    const user = await User.findById({
      _id: userId,
    });
    if (!user) {
      return res.status(404).json({ error: "Người dùng không tồn tại." });
    }

    // Kiểm tra mật khẩu hiện tại của người dùng có đúng không
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Mật khẩu hiện tại không đúng." });
    }

    // Mã hóa mật khẩu mới trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới cho người dùng
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Mật khẩu đã được thay đổi thành công!" });
  } catch (error) {
    console.error("Lỗi khi thay đổi mật khẩu:", error);
    res.status(500).json({ error: "Đã có lỗi xảy ra khi thay đổi mật khẩu!" });
  }
});

module.exports = router;
