const express = require("express");
const router = express.Router();
const { checkUserJWT } = require("../../middleware/JWTAction");
const {
  Register,
  //
  getUserAccount,
  updateUserAccount,
  //
  authenticateLocal,
  getUserOrders,
} = require("../../controllers/user/user.controller");
////////////////////////
///////////////////////

// router.all("*", checkUserJWT);
router.post("/register", Register); // Đăng ký
router.post("/login", authenticateLocal); // Đăng nhập

router.get("/account", checkUserJWT, getUserAccount); // Lấy thông tin người dùng
router.patch("/account/update", checkUserJWT, updateUserAccount); // Cập nhật thông tin người dùng

router.get("/order", checkUserJWT, getUserOrders); // Lấy thông tin các đơn hàng

module.exports = router;
