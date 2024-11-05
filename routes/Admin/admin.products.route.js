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
  getVariants,
  updateCategory,

  deleteBrand,
  getTrashBrand,
  reStoreBrand,
  forceDeleteBrand,
  countStoreStrash,
  getProductDetails,
} = require("../../controllers/admin/admin.products.controller");

const {
  getCategory,
  getBrand,
} = require("../../controllers/product.controller");

router.get("/", getAdminProducts);
router.get("/detail/:id", getProductDetails);
router.get("/:id/variants", getVariants);

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
router.delete("/brand/delete/:id", deleteBrand);
router.get("/brand/trash", getTrashBrand);
router.patch("/brand/:id/restore", reStoreBrand);
router.delete("/brand/delete/:id/force", forceDeleteBrand);

// Route của Category (Chuyên mục)
router.post("/category/create", createCategory);
router.put("/category/update", updateCategory);

// Route của UseCase (Trường hợp sử dụng)
router.get("/use_case", getUseCase);

// router test tổng quát
router.get("/trash/sum", countStoreStrash);

module.exports = router;

// CẦN BỔ SUNG MIDDLEWARE
