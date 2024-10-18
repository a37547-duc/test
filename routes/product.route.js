const express = require("express");

const {
  getAllProducts,
  getDetailProduct,
  getCategory,
  getBrand,

  getProductList,
  getBrandsByName,
  getBrandLaptop,
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getAllProducts);

router.get("/category/", getCategory);

router.get("/brand", getBrand);
router.get("/laptop/brands", getBrandLaptop);
//
router.get("/:id", getDetailProduct); // dynamic route
router.get("/category/brands", getBrandsByName);
module.exports = router;

//  Cần bổ sung middleware
