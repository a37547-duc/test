const express = require("express");
const {
  getUserTier,
  handleDiscountCheck,
} = require("../../controllers/userTier/userTier.controller");

const { checkRoles } = require("../../middleware/auth.middleare");
const {
  checkUserJWT,
  createJWT,
  verifyToken,
} = require("../../middleware/JWTAction");
const router = express.Router();

router.get("/", checkUserJWT, checkRoles(["user"]), getUserTier);
router.post(
  "/check-discount",
  checkUserJWT,
  checkRoles(["user"]),
  handleDiscountCheck
);
module.exports = router;
