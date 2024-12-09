const express = require("express");

const {
  getAllProducts,
  getDetailProduct,
  getAllProductBySearch,
  getCategory,
  getBrand,

  getBrandsByName,
  getBrandLaptop,
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getAllProducts);

router.get("/search", getAllProductBySearch);

router.get("/category/", getCategory);

router.get("/brand", getBrand);

// Route Test
router.get("/:id", getDetailProduct); // dynamic route

router.get("/laptop/brands", getBrandLaptop);
router.get("/category/brands", getBrandsByName);
module.exports = router;

//  Cần bổ sung middleware
