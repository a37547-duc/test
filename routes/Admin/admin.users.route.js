const express = require("express");
const router = express.Router();

const { getUsers } = require("../../controllers/admin/admin.users.controller");

// Auth middleware
const { checkRoles } = require("../../middleware/auth.middleare");

const { checkUserJWT } = require("../../middleware/JWTAction");

router.use(checkUserJWT, checkRoles(["admin"]));

router.get("/", getUsers);

module.exports = router;
