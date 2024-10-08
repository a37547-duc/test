/*
  Mục đích của file
    Product: 
        1. Tạo sản phẩm Product - (createProduct) x
            - Tạo biến thể sản phẩm - (addProductVariant) x 
        2. Cập nhật thông tin sản phẩm
            - Cập nhật biến thể của sản phẩm x 
        3. Xóa sản phẩm
        4. Lấy danh sách sản phẩm
    Category:
        1. Tạo chuyên mục
        2. Xóa chuyên mục
        3. Cập nhật chuyên mục
        4. Lấy danh sách các chuyên mục  
    Brand:
        1. Tạo thương hiệu
        2. Xóa thương hiệu
        3. Cập nhật thương hiệu
        4. Lấy danh sách các chuyên mục
*/

const express = require("express");
const router = express.Router();
const {
  getAdminProducts,
  createProduct,
  addProductVariant,
  updateProductVariant,
  getBrandsByCategoryId,
  createBrand,
  createCategory,
  editProduct,
  getUseCase,
} = require("../../controllers/admin/admin.products.controller");

const {
  getAllProducts,
  getDetailProduct,
  getCategory,
  getBrand,
} = require("../../controllers/product.controller");

router.get("/", getAdminProducts);
router.post("/create", createProduct);
router.patch("/edit/:id", editProduct);

router.post("/variants/add/:id", addProductVariant);

router.put("/variants/update/:id", updateProductVariant);

// Route của Products (Sản phẩm)
router.get("/category", getCategory);
router.get("/brand", getBrand);
router.get("/category/:id/brands", getBrandsByCategoryId);

// Route của Brand (Thương hiệu)
router.post("/brand/create", createBrand);

// Route của Category (Chuyên mục)
router.post("/brand/create", createCategory);

// Route của UseCase (Trường hợp sử dụng)
router.get("/use_case", getUseCase);
module.exports = router;

// CẦN BỔ SUNG MIDDLEWARE
