const express = require("express");
const router = express.Router();
const { checkUserJWT } = require("../../middleware/JWTAction");
const { getUserAccount } = require("../../controllers/user/user.controller");
////////////////////////
///////////////////////

// router.all("*", checkUserJWT);
router.get("/account", checkUserJWT, getUserAccount);
module.exports = router;
