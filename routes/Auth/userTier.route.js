const express = require("express");
const {
  getUserTier,
} = require("../../controllers/userTier/userTier.controller");

const { checkRoles } = require("../../middleware/auth.middleare");
const {
  checkUserJWT,
  createJWT,
  verifyToken,
} = require("../../middleware/JWTAction");
const router = express.Router();

router.get("/", checkUserJWT, checkRoles(["user"]), getUserTier);

module.exports = router;
