const express = require("express");

const {
  getAllProducts,
  getDetailProduct,
  getCategory,
  getBrand,
  getBrandsByCategoryId,
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getAllProducts);

router.get("/category/", getCategory);
router.get("/brand", getBrand);
router.get("/:id", getDetailProduct); // dynamic route
router.get("/category/:id/brands", getBrandsByCategoryId);
module.exports = router;

//  Cần bổ sung middleware
