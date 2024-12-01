const express = require("express");
const router = express.Router();

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

const { checkUserJWT } = require("../../middleware/JWTAction");
const { checkRoles } = require("../../middleware/auth.middleare");

// router.use(checkUserJWT, checkRoles(["admin"]));

router.post("/register", Register); // Đăng ký
router.post("/login", authenticateLocal); // Đăng nhập

router.get("/account", checkUserJWT, checkRoles(["admin"]), getUserAccount);

router.patch(
  "/account/update",
  checkUserJWT,
  checkRoles(["admin"]),
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

module.exports = router;
