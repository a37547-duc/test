const Product = require("../../models/productModel");
const mongoose = require("mongoose");
const Brand = require("../../models/brandModel");
const Category = require("../../models/categoryModel");
const Order = require("../../models/Order/OrderModel");
const {
  LaptopVariant,
  ProductVariantBase,
} = require("../../models/Products_Skus/productSkudModel");

// CÁC CHỨC NĂNG Products (Sản phẩm)

const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $match: {
          deleted: false,
          isHardDeleted: false,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: {
          path: "$brand",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "productvariantbases",
          localField: "_id",
          foreignField: "productId",
          as: "product_variants",
        },
      },
      {
        $addFields: {
          allOutOfStock: {
            $allElementsTrue: {
              $map: {
                input: "$product_variants",
                as: "variant",
                in: { $eq: ["$$variant.stock_quantity", 0] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          status: {
            $cond: {
              if: "$allOutOfStock",
              then: "out of stock",
              else: "$status",
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          images: 1,
          description: 1,
          status: 1,
          type: 1,
          "category.name": 1,
          "category._id": 1,
          "brand.name": 1,
          "brand._id": 1,
          product_variants: 1,
          stock_quantity: "$product_variants.stock_quantity",
        },
      },
    ]);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching admin products:", error);
    res.status(500).json({ error: error.message });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//   try {
//     const products = await Product.aggregate([
//       {
//         $lookup: {
//           from: "categories",
//           localField: "category",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       {
//         $unwind: "$category",
//       },
//       {
//         $lookup: {
//           from: "brands",
//           localField: "brand",
//           foreignField: "_id",
//           as: "brand",
//         },
//       },
//       {
//         $unwind: "$brand",
//       },
//       {
//         $lookup: {
//           from: "usecases",
//           localField: "use_case_ids",
//           foreignField: "_id",
//           as: "use_cases",
//         },
//       },
//       {
//         $unwind: "$use_cases",
//       },
//       {
//         $lookup: {
//           from: "productvariantbases",
//           localField: "_id",
//           foreignField: "productId",
//           as: "product_variants",
//         },
//       },
//       {
//         $addFields: {
//           allOutOfStock: {
//             $allElementsTrue: {
//               $map: {
//                 input: "$product_variants",
//                 as: "variant",
//                 in: { $eq: ["$$variant.stock_quantity", 0] },
//               },
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           status: {
//             $cond: {
//               if: "$allOutOfStock",
//               then: "out of stock",
//               else: "$status",
//             },
//           },
//         },
//       },
//       {
//         $facet: {
//           mice: [
//             { $match: { type: "MouseVariant" } }, // Lọc ra sản phẩm MouseVariant
//             { $limit: 5 },
//           ],
//           laptops: [
//             { $match: { type: "LaptopVariant" } }, // Lọc ra sản phẩm LaptopVariant
//             { $limit: 5 },
//           ],
//         },
//       },
//       {
//         $project: {
//           mice: {
//             name: 1,
//             price: 1,
//             images: 1,
//             status: 1,
//             type: 1,
//             "category.name": 1,
//             "category._id": 1,
//             "brand.name": 1,
//             "brand._id": 1,
//             "use_cases.name": 1,
//             "use_cases._id": 1,
//             product_variants: 1,
//             stock_quantity: "$product_variants.stock_quantity",
//           },
//           laptops: {
//             name: 1,
//             price: 1,
//             images: 1,
//             status: 1,
//             type: 1,
//             "category.name": 1,
//             "category._id": 1,
//             "brand.name": 1,
//             "brand._id": 1,
//             "use_cases.name": 1,
//             "use_cases._id": 1,
//             product_variants: 1,
//             stock_quantity: "$product_variants.stock_quantity",
//           },
//         },
//       },
//     ]);

//     res.status(200).json(products[0]); // Trả về kết quả từ facet
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Tên sản phẩm đã tồn tại" });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Tìm và cập nhật trạng thái deleted (xóa mềm)
    const deletedProduct = await Product.findByIdAndUpdate(
      productId,
      { deleted: true },
      { new: true } // Trả về document sau khi cập nhật
    );

    if (!deletedProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json({
      message: "Sản phẩm đã được xóa mềm thành công",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CÁC CHỨC NĂNG Variants (Biến thể)
// const getVariants = async (req, res) => {
//   try {
//     const productId = req.params.id;

//     // Tìm các biến thể với điều kiện productId và deleted = false
//     const variants = await ProductVariantBase.find({
//       productId: productId,
//       deleted: false, // Chỉ lấy những biến thể chưa bị xóa mềm
//     });

//     // Kiểm tra nếu không có biến thể nào
//     if (variants.length === 0) {
//       return res
//         .status(200)
//         .json({ message: "Sản phẩm này chưa có biến thể nào", data: [] });
//     }

//     // Trả về danh sách các biến thể
//     res.status(200).json(variants);
//   } catch (error) {
//     console.error("Lỗi khi tìm biến thể sản phẩm", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

const getVariants = async (req, res) => {
  try {
    const productId = req.params.id;

    // Tìm các biến thể với điều kiện productId và deleted = false
    const variants = await ProductVariantBase.find({
      productId: productId,
      deleted: false, // Chỉ lấy những biến thể chưa bị xóa mềm
    });

    // Trả về danh sách biến thể hoặc mảng rỗng nếu không có
    res.status(200).json({
      message:
        variants.length > 0
          ? "Danh sách biến thể"
          : "Sản phẩm này chưa có biến thể nào",
      data: variants,
    });
  } catch (error) {
    console.error("Lỗi khi tìm biến thể sản phẩm", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const softDeleteVariant = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID của biến thể cần xóa từ URL

    // Tìm và cập nhật trường `deleted` thành `true`
    const updatedVariant = await ProductVariantBase.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true } // Trả về biến thể sau khi cập nhật
    );

    // Nếu không tìm thấy biến thể
    if (!updatedVariant) {
      return res.status(404).json({ message: "Biến thể không tồn tại" });
    }

    // Trả về thông báo thành công
    res.status(200).json({
      message: "Xóa mềm biến thể thành công",
      data: updatedVariant,
    });
  } catch (error) {
    console.error("Lỗi khi xóa mềm biến thể", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addProductVariant = async (req, res) => {
  try {
    const productId = req.params.id; // Lấy ID sản phẩm chính từ params
    const variantData = req.body; // Dữ liệu biến thể từ body
    const { type } = variantData; // Lấy type từ dữ liệu gửi lên

    // Kiểm tra xem sản phẩm chính có tồn tại không
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm chính với ID này" });
    }

    let VariantModel;

    // Kiểm tra loại biến thể để chọn model tương ứng
    if (type === "LaptopVariant") {
      VariantModel = LaptopVariant; // Dùng model LaptopVariant
    } else {
      return res.status(400).json({ message: "Loại sản phẩm không hợp lệ" });
    }

    // Khởi tạo biến thể mới
    const newVariant = new VariantModel({
      productId: productId,
      ...variantData,
    });

    // Lưu biến thể vào database
    const savedVariant = await newVariant.save();

    return res.status(201).json({
      message: `Thêm sản phẩm ${type} thành công`,
      variant: savedVariant,
    });
  } catch (error) {
    console.error("Lỗi thêm sản phẩm variant:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi thêm sản phẩm variant" });
  }
};

const updateProductVariant = async (req, res) => {
  try {
    const variantId = req.params.id; // ID của variant cần cập nhật
    const updateData = req.body; // Dữ liệu cập nhật từ body
    console.log(updateData);
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Kiểm tra sự tồn tại của variant
    const variantExists = await ProductVariantBase.findById(variantId);
    if (!variantExists) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm variant với ID này",
      });
    }

    // Cập nhật sản phẩm variant
    const updatedVariant = await ProductVariantBase.findByIdAndUpdate(
      { _id: variantId },
      { $set: updateData },
      { new: true, runValidators: true } // Trả về document sau khi cập nhật và kiểm tra dữ liệu
    );
    console.log(updatedVariant);
    return res.status(200).json({
      message: "Cập nhật sản phẩm variant thành công",
      variant: updatedVariant,
    });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm variant:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi cập nhật sản phẩm variant",
      error: error.message,
    });
  }
};

const getBrandsByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Lấy danh sách các hãng sản phẩm thuộc về category
    const brands = await Brand.find({ category_id: categoryId });

    res.status(200).json(brands);
  } catch (error) {
    console.error("Lỗi lấy brands bằng category", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CÁC CHỨC NĂNG  Brand (Thương hiệu)
const getBrand = async (req, res) => {
  try {
    // Lấy danh sách các thương hiệu chưa bị xóa mềm
    const brands = await Brand.find({ deleted: false });

    if (brands.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có thương hiệu nào được tìm thấy" });
    }

    res.status(200).json(brands);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thương hiệu:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, category_id, image } = req.body;

    // Tạo một Brand mới
    const newBrand = new Brand({
      name,
      category_id,
      image,
    });

    const savedBrand = await newBrand.save();

    res.status(201).json({
      message: "Brand created successfully",
      brand: savedBrand,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Tên thương hiệu đã tồn tại" });
    }

    console.error("Error creating brand:", error.message);
    res.status(500).json({ message: "Failed to create brand" });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brandId = req.params.id; // Lấy ID từ params
    const updateData = req.body; // Dữ liệu cần cập nhật từ body

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Cập nhật thông tin thương hiệu
    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      { $set: updateData },
      { new: true, runValidators: true } // Bật runValidators để kích hoạt middleware
    );

    if (!updatedBrand) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thương hiệu với ID này" });
    }

    res.status(200).json({
      message: "Cập nhật thương hiệu thành công",
      brand: updatedBrand,
    });
  } catch (error) {
    // Bắt lỗi từ middleware
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    // Lỗi khác
    console.error("Lỗi khi cập nhật thương hiệu:", error.message);
    res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật thương hiệu" });
  }
};

const deleteBrand = async (req, res) => {
  const brandId = req.params.id;

  try {
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Tìm và cập nhật trường `deleted` thành true (xóa mềm)
    const deletedBrand = await Brand.findByIdAndUpdate(
      brandId,
      { deleted: true, isHardDeleted: false }, // Đặt cờ deleted và isHardDeleted
      { new: true } // Trả về document sau khi cập nhật
    );

    if (!deletedBrand) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thương hiệu với ID này" });
    }

    res.status(200).json({
      message: "Thương hiệu đã được xóa mềm thành công",
      data: deletedBrand,
    });
  } catch (error) {
    console.error("Lỗi khi xóa mềm thương hiệu:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

const getTrashBrand = async (req, res) => {
  try {
    const trashbrand = await Brand.findWithDeleted({ deleted: true });

    res.status(200).json(trashbrand);
  } catch (error) {
    console.error("Lỗi lấy các thương hiệu đã bị xóa", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CHƯA SỬ DỤNG
const reStoreBrand = async (req, res) => {
  try {
    const brandId = req.params.id;

    const restoreResult = await Brand.restore({ _id: brandId });

    if (restoreResult.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy brand để khôi phục." });
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      { $set: { isHardDeleted: false } },
      { new: true }
    );

    res.status(200).json({
      message: "Brand đã được khôi phục",
      brand: updatedBrand,
    });
  } catch (error) {
    console.error("Lỗi không thể khôi phục Brand:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const forceDeleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;

    const result = await Brand.findOneAndUpdate(
      { _id: brandId, deleted: true },
      { $set: { isHardDeleted: true } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        message: "Không tìm thấy brand hoặc không phải đã xóa mềm.",
      });
    }

    res.status(200).json({
      message: "Brand đã được cài đặt xóa vĩnh viễn",
      result,
    });
  } catch (error) {
    console.error("Lỗi không thể cài đặt xóa Brand vĩnh viễn:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const countStoreStrash = async (req, res) => {
  try {
    const counttrash = await Brand.countDocumentsDeleted();

    res.status(200).json({
      message: "Số lượng đã xóa tương ứng",
      counttrash,
    });
  } catch (error) {
    console.error("Lỗi không thể lấy số lượng đã xóa:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CÁC CHỨC NĂNG Category (Chuyên mục)

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Tạo một Category mới
    const newCategory = new Category({
      name,
      description,
    });

    // Lưu vào cơ sở dữ liệu
    const savedCategory = await newCategory.save();

    res.status(201).json({
      message: "Category tạo thành công",
      category: savedCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Lỗi trùng lặp unique key
      return res.status(400).json({
        message: "Tên danh mục đã tồn tại",
      });
    }

    console.error("Lỗi tạo category:", error.message);
    res.status(500).json({ message: "Lỗi tạo Category" });
  }
};

const getCategory = async (req, res) => {
  try {
    // Lấy danh sách các danh mục chưa bị xóa mềm
    const categories = await Category.find({ deleted: false });

    if (categories.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có danh mục nào được tìm thấy" });
    }

    res.status(200).json(categories);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updatedata = req.body;

    const updatedVariant = await Category.findByIdAndUpdate(
      categoryId,
      { $set: updatedata },
      { new: true }
    );

    return res.status(200).json({
      message: "Cập nhật category thành công",
      variant: updatedVariant,
    });
  } catch (error) {
    // Bắt lỗi từ middleware
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Lỗi cập nhật sản phẩm category:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi cập nhật sản phẩm category" });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Xóa mềm danh mục
    const deletedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { deleted: true, isHardDeleted: false }, // Đánh dấu là xóa mềm
      { new: true }
    );

    if (!deletedCategory) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy danh mục với ID này" });
    }

    res.status(200).json({
      message: "Danh mục đã được xóa mềm thành công",
      category: deletedCategory,
    });
  } catch (error) {
    console.error("Lỗi khi xóa mềm danh mục:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa mềm danh mục" });
  }
};

// CÁC CHỨC NĂNG CỦA ORDER (Thống kê)

async function getOrderStats(req, res) {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp startDate và endDate." });
    }

    const start = new Date(`${startDate}T00:00:00Z`); // Bắt đầu ngày (00:00 UTC)
    const end = new Date(`${endDate}T23:59:59Z`); // Kết thúc ngày (23:59 UTC)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "startDate hoặc endDate không hợp lệ." });
    }

    // Lấy dữ liệu từ MongoDB
    const orders = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end }, // Lọc theo khoảng thời gian
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "Đã thanh toán"] }, // Chỉ tính doanh thu nếu đã thanh toán
                "$totalAmount",
                0,
              ],
            },
          }, // Tổng doanh thu
          totalOrders: { $sum: 1 }, // Tổng số đơn hàng
          canceledOrders: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "Đã hủy"] }, 1, 0],
            },
          }, // Tổng số đơn hàng bị hủy
        },
      },
    ]);

    // Trả về dữ liệu JSON
    return res.json(
      orders.length > 0
        ? orders[0]
        : { totalRevenue: 0, totalOrders: 0, canceledOrders: 0 }
    );
  } catch (error) {
    console.error("Lỗi khi lấy thống kê đơn hàng:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi trong quá trình xử lý dữ liệu." });
  }
}

module.exports = {
  deleteProduct,
  getProductDetails,
  createProduct,

  // Variants
  addProductVariant,
  softDeleteVariant,
  updateProductVariant,
  getBrandsByCategoryId,
  createBrand,

  getAdminProducts,
  editProduct,
  getVariants,

  // Category
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,

  // Brand
  getBrand,
  deleteBrand,
  getTrashBrand,
  updateBrand,
  // reStoreBrand,
  // forceDeleteBrand,
  // countStoreStrash,

  // Order
  getOrderStats,
};
