const express = require("express");
const router = express.Router();
const {
  getAllTier,
  updateTier,
  deleteTier,
  createTier,
} = require("../../controllers/tier/tier.controller");

// Auth middleare
const { checkRoles } = require("../../middleware/auth.middleare");

const { checkUserJWT } = require("../../middleware/JWTAction");

router.use(checkUserJWT, checkRoles(["admin"]));

router.get("/", getAllTier);
router.post("/create", createTier);
router.patch("/update/:id", updateTier);
router.delete("/delete/:tierId", deleteTier);

module.exports = router;
