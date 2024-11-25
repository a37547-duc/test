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
  // PRODUCTS
  getAdminProducts,
  deleteProduct,
  createProduct,
  editProduct,

  //   VARIANTS
  getVariants,
  addProductVariant,
  updateProductVariant,
  softDeleteVariant,

  // CATEGORY
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,

  // BRAND
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  getProductDetails,
  // getTrashBrand,
  // reStoreBrand,
  // forceDeleteBrand,
  // countStoreStrash,

  // Order
  getOrderStats,
} = require("../../controllers/admin/admin.products.controller");

router.get("/", getAdminProducts);
router.get("/detail/:id", getProductDetails);
router.post("/create", createProduct);
router.patch("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);

// ROUTER VARIANTS
router.get("/:id/variants", getVariants);
router.post("/variants/add/:id", addProductVariant);
router.patch("/variants/update/:id", updateProductVariant);
router.delete("/variants/delete/:id", softDeleteVariant);

// Route của Brand (Thương hiệu)
router.get("/brand", getBrand);
router.post("/brand/create", createBrand);
router.patch("/brand/update/:id", updateBrand);
router.delete("/brand/delete/:id", deleteBrand);

// router.get("/brand/trash", getTrashBrand);
// router.patch("/brand/:id/restore", reStoreBrand);
// router.delete("/brand/delete/:id/force", forceDeleteBrand);

// Route của Category (Chuyên mục)
router.get("/category", getCategory);
router.post("/category/create", createCategory);
router.patch("/category/update/:id", updateCategory);
router.delete("/category/delete/:id", deleteCategory);

// router test tổng quát
// router.get("/trash/sum", countStoreStrash);

router.post("/order/stats", getOrderStats);

module.exports = router;

// CẦN BỔ SUNG MIDDLEWARE
