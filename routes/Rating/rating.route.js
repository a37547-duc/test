const express = require("express");
const router = express.Router();

const { checkUserJWT } = require("../../middleware/JWTAction");

const {
  getRating,
  postRating,
} = require("../../controllers/rating/rating.controller");

router.get("/:productId", getRating);

router.post("/post", checkUserJWT, postRating);

module.exports = router;
