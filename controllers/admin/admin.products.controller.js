const Product = require("../../models/productModel");
const ProductVariant = require("../../models/Products_Skus/productSkudModel");
const Brand = require("../../models/brandModel");
const Category = require("../../models/categoryModel");
const Usecase = require("../../models/usecaseModel");
const {
  ProductVariantBase,
  LaptopVariant,
  MouseVariant,
} = require("../../models/Products_Skus/productSkudModel");

// CÁC CHỨC NĂNG Products (Sản phẩm)

const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
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
        $unwind: "$brand",
      },
      {
        $lookup: {
          from: "usecases",
          localField: "use_case_ids",
          foreignField: "_id",
          as: "use_cases",
        },
      },
      {
        $unwind: "$use_cases", // Chuyển mảng use_cases thành object
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
                in: { $eq: ["$$variant.stock_quantity", 0] }, // Kiểm tra nếu stock_quantity = 0
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
            }, // Cập nhật trạng thái sản phẩm
          },
        },
      },

      {
        $project: {
          name: 1,
          price: 1,
          images: 1,
          status: 1,
          type: 1,
          "category.name": 1,
          "category._id": 1,
          "brand.name": 1,
          "brand._id": 1,
          "use_cases.name": 1,
          "use_cases._id": 1,
          product_variants: 1,
          stock_quantity: "$product_variants.stock_quantity", // Thông tin chi tiết về tồn kho
        },
      },
    ]);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    res.status(200).json({ product, message: "Chi tiết sản phẩm tổng quát" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// const getAdminProducts = async (req, res) => {
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

const getVariants = async (req, res) => {
  try {
    const productId = req.params.id;

    const variants = await ProductVariantBase.find({ productId: productId });

    // Kiểm tra nếu không có biến thể nào
    if (variants.length === 0) {
      return res
        .status(404)
        .json({ message: "Sản phẩm này chưa có biến thể nào" });
    }

    res.status(200).json(variants);
  } catch (error) {
    console.error("Lỗi khi tìm biến thể sản phẩm", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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

const addProductVariant = async (req, res) => {
  try {
    const productId = req.params.id;
    const variantData = req.body;
    const { type } = variantData;

    // Kiểm tra xem sản phẩm chính có tồn tại không
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm chính với ID này" });
    }

    let newVariant;
    switch (type) {
      case "LaptopVariant":
        newVariant = new LaptopVariant({
          productId: productId,
          ...variantData,
        });
        break;

      case "MouseVariant":
        newVariant = new MouseVariant({
          productId: productId,
          ...variantData,
        });
        break;

      default:
        return res.status(400).json({ message: "Loại sản phẩm không hợp lệ" });
    }

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
    const productId = req.params.id;
    const updatedata = req.body;
    console.log(productId);
    const variantExists = await ProductVariant.findOne({
      _id: productId,
    });

    if (!variantExists) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm variant với ID này ee",
      });
    }

    const updatedVariant = await ProductVariant.findByIdAndUpdate(
      productId,
      { $set: updatedata },
      { new: true } // Trả về bản ghi sau khi cập nhật
    );

    return res.status(200).json({
      message: "Cập nhật sản phẩm variant thành công",
      variant: updatedVariant,
    });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm variant:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi cập nhật sản phẩm variant" });
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
const createBrand = async (req, res) => {
  try {
    const { name, category_id, image } = req.body;

    // Tạo một Brand mới
    const newBrand = new Brand({
      name,
      category_id: category_id,

      image,
    });

    const savedBrand = await newBrand.save();

    res.status(201).json({
      message: "Brand created successfully",
      brand: savedBrand,
    });
  } catch (error) {
    console.error("Error creating brand:", error.message);
    res.status(500).json({ message: "Failed to create brand" });
  }
};

const deleteBrand = async (req, res) => {
  const brandId = req.params.id;

  try {
    // Soft delete brand bằng cách đặt `deleted: true`
    const deletedBrand = await Brand.delete({ _id: brandId });

    if (!deletedBrand) {
      return res.status(404).json({ message: "Không tìm thấy id brand" });
    }

    res
      .status(200)
      .json({ message: "Brand xóa mềm thành công", data: deletedBrand });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
    console.error("Lỗi tạo category:", error.message);
    res.status(500).json({ message: "Lỗi tạo Category" });
  }
};
const getCategory = async (req, res) => {
  try {
    // Lấy danh sách các hãng sản phẩm thuộc về category
    const category = await Category.find({});

    res.status(200).json(category);
  } catch (error) {
    console.error("Lỗi lấy Category", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    console.error("Lỗi cập nhật sản phẩm category:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi cập nhật sản phẩm category" });
  }
};

// CÁC CHỨC NĂNG UseCase (Trường hợp sử dụng)
const getUseCase = async (req, res) => {
  try {
    const use_case = await Usecase.find({});
    res.status(200).json(use_case);
  } catch (error) {
    console.error("Lỗi lấy UseCase", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProductDetails,
  createProduct,
  addProductVariant,
  updateProductVariant,
  getBrandsByCategoryId,
  createBrand,
  createCategory,
  getCategory,
  getAdminProducts,
  editProduct,
  getUseCase,
  getVariants,
  updateCategory,

  deleteBrand,
  getTrashBrand,
  reStoreBrand,
  forceDeleteBrand,
  countStoreStrash,
};
