const express = require("express");

const {
  getAllProducts,
  getDetailProduct,
  getCategory,
  getBrand,

  getBrandsByName,
  getBrandLaptop,
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getAllProducts);

router.get("/category/", getCategory);

router.get("/brand", getBrand);

// Route Test
router.get("/:id", getDetailProduct); // dynamic route

router.get("/laptop/brands", getBrandLaptop);
router.get("/category/brands", getBrandsByName);
module.exports = router;

//  Cần bổ sung middleware
