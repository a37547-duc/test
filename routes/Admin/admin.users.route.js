const express = require("express");
const router = express.Router();

const { getUsers } = require("../../controllers/admin/admin.users.controller");

router.get("/", getUsers);

module.exports = router;
