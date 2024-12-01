const express = require("express");
const router = express.Router();

const {
  getAdminOrders,
  updateAdminOrder,
} = require("../../controllers/admin/admin.orders.controller");

const { checkUserJWT } = require("../../middleware/JWTAction");
const { checkRoles } = require("../../middleware/auth.middleare");

router.use(checkUserJWT, checkRoles(["admin"]));
router.get("/", getAdminOrders);
router.patch("/update/:id", updateAdminOrder);

module.exports = router;
