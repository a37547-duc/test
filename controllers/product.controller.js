const mongoose = require("mongoose");
const Product = require("../models/productModel");

const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");

const {
  ProductVariantBase,
} = require("../models/Products_Skus/productSkudModel");

// PRODUCTS

//////////////////////

///////////////////////////////////////
// const getAllProducts = async (req, res) => {
//   try {
//     const { categoryName, brandName, searchName, minPrice, maxPrice } =
//       req.query; // Lấy categoryName, brandName, minPrice, maxPrice từ query parameters

//     let matchStage = {
//       deleted: false,
//       isHardDeleted: false,
//     };

//     // Nếu có categoryName, lọc theo category
//     if (categoryName) {
//       const category = await Category.findOne({
//         name: { $regex: new RegExp(categoryName, "i") }, // Tìm kiếm không phân biệt hoa thường
//         deleted: false,
//         isHardDeleted: false,
//       });

//       if (!category) {
//         return res.status(404).json({ message: "Category not found" });
//       }

//       // Lọc sản phẩm theo _id của danh mục
//       matchStage.category = category._id;
//     }

//     // Nếu có brandName, lọc theo brand
//     if (brandName) {
//       const brand = await Brand.findOne({
//         name: { $regex: new RegExp(brandName, "i") }, // Tìm kiếm không phân biệt hoa thường
//         deleted: false,
//         isHardDeleted: false,
//       });

//       if (!brand) {
//         return res.status(404).json({ message: "Brand not found" });
//       }

//       // Lọc sản phẩm theo _id của brand
//       matchStage.brand = brand._id;
//     }
//     if (searchName) {
//       matchStage.name = { $regex: new RegExp(searchName, "i") }; // Tìm kiếm không phân biệt hoa thường
//     }

//     // Khởi tạo minPriceValue và maxPriceValue mặc định là không có giá trị
//     let minPriceValue = null;
//     let maxPriceValue = null;

//     // Chỉ chuyển đổi nếu minPrice hoặc maxPrice tồn tại trong query
//     if (minPrice) {
//       minPriceValue = parseFloat(minPrice);
//     }
//     if (maxPrice) {
//       maxPriceValue = parseFloat(maxPrice);
//     }

//     // Pipeline aggregate để lấy sản phẩm
//     const products = await Product.aggregate([
//       { $match: matchStage }, // Lọc theo điều kiện (categoryName, brandName nếu có)
//       {
//         $lookup: {
//           from: "categories",
//           localField: "category",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "brands",
//           localField: "brand",
//           foreignField: "_id",
//           as: "brand",
//         },
//       },
//       { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "productvariantbases",
//           localField: "_id",
//           foreignField: "productId",
//           as: "product_variants",
//         },
//       },
//       // Lọc các product_variants theo các điều kiện stock_quantity, deleted và price
//       {
//         $addFields: {
//           product_variants_filtered: {
//             $filter: {
//               input: "$product_variants",
//               as: "variant",
//               cond: {
//                 $and: [
//                   { $gt: ["$$variant.stock_quantity", 0] }, // stock_quantity > 0
//                   { $eq: ["$$variant.deleted", false] }, // deleted: false
//                   // Lọc theo price nếu minPriceValue hoặc maxPriceValue tồn tại
//                   ...(minPriceValue
//                     ? [{ $gte: ["$$variant.price", minPriceValue] }]
//                     : []),
//                   ...(maxPriceValue
//                     ? [{ $lte: ["$$variant.price", maxPriceValue] }]
//                     : []),
//                 ],
//               },
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           product_variants: { $arrayElemAt: ["$product_variants_filtered", 0] }, // Chọn variant đầu tiên
//         },
//       },
//       {
//         $addFields: {
//           allOutOfStock: {
//             $allElementsTrue: {
//               $map: {
//                 input: "$product_variants_filtered",
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
//         $project: {
//           _id: 1,
//           name: 1,
//           deleted: 1,
//           isHardDeleted: 1,
//           price: 1,
//           images: 1,
//           status: 1,
//           type: 1,
//           "category.name": 1,
//           "category._id": 1,
//           "brand.name": 1,
//           "brand._id": 1,
//           product_variants: 1,
//           discountedPrice: "$product_variants.discountedPrice", // Chọn giá sau giảm
//           discount: "$product_variants.discount", // Thêm discount
//           stock_quantity: "$product_variants.stock_quantity",
//         },
//       },
//     ]);

//     if (!products.length) {
//       return res
//         .status(404)
//         .json({ message: "No products found for this category/brand/price" });
//     }

//     res.status(200).json(products); // Trả về danh sách sản phẩm
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

const getAllProducts = async (req, res) => {
  try {
    const { categoryName, brandName, searchName, minPrice, maxPrice } =
      req.query;

    let matchStage = {
      deleted: false,
      isHardDeleted: false,
    };

    // Lọc theo categoryName
    if (categoryName) {
      const category = await Category.findOne({
        name: { $regex: new RegExp(categoryName, "i") },
        deleted: false,
        isHardDeleted: false,
      });

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      matchStage.category = category._id;
    }

    // Lọc theo brandName
    if (brandName) {
      const brand = await Brand.findOne({
        name: { $regex: new RegExp(brandName, "i") },
        deleted: false,
        isHardDeleted: false,
      });

      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      matchStage.brand = brand._id;
    }

    // Lọc theo searchName
    if (searchName) {
      matchStage.name = { $regex: new RegExp(searchName, "i") };
    }

    // Chuyển đổi minPrice và maxPrice
    const minPriceValue = minPrice ? parseFloat(minPrice) : null;
    const maxPriceValue = maxPrice ? parseFloat(maxPrice) : null;

    // Pipeline Aggregate
    const products = await Product.aggregate([
      { $match: matchStage }, // Điều kiện chung cho sản phẩm
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "productvariantbases",
          localField: "_id",
          foreignField: "productId",
          as: "product_variants",
        },
      },
      // Lọc product_variants theo stock_quantity, deleted và price
      {
        $addFields: {
          product_variants_filtered: {
            $filter: {
              input: "$product_variants",
              as: "variant",
              cond: {
                $and: [
                  { $gt: ["$$variant.stock_quantity", 0] }, // stock_quantity > 0
                  { $eq: ["$$variant.deleted", false] }, // deleted: false
                  ...(minPriceValue
                    ? [{ $gte: ["$$variant.price", minPriceValue] }]
                    : []),
                  ...(maxPriceValue
                    ? [{ $lte: ["$$variant.price", maxPriceValue] }]
                    : []),
                ],
              },
            },
          },
        },
      },
      // Chọn biến thể đầu tiên từ danh sách đã lọc
      {
        $addFields: {
          product_variants: { $arrayElemAt: ["$product_variants_filtered", 0] },
        },
      },
      // Tính discountedPrice dựa trên price và discount của product_variants
      {
        $addFields: {
          "product_variants.discountedPrice": {
            $cond: {
              if: {
                $and: [
                  { $gt: ["$product_variants.price", 0] },
                  { $gt: ["$product_variants.discount", 0] },
                ],
              },
              then: {
                $subtract: [
                  "$product_variants.price",
                  {
                    $multiply: [
                      "$product_variants.price",
                      { $divide: ["$product_variants.discount", 100] },
                    ],
                  },
                ],
              },
              else: "$product_variants.price",
            },
          },
        },
      },
      // Cập nhật trạng thái "out of stock"
      {
        $addFields: {
          allOutOfStock: {
            $allElementsTrue: {
              $map: {
                input: "$product_variants_filtered",
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
              else: "available",
            },
          },
        },
      },
      // Chọn các trường cần trả về
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          discountedPrice: "$product_variants.discountedPrice", // Giá sau giảm
          discount: "$product_variants.discount", // Phần trăm giảm giá
          images: 1,
          status: 1,
          type: 1,
          "category.name": 1,
          "brand.name": 1,
          product_variants: 1,
          stock_quantity: "$product_variants.stock_quantity", // Số lượng tồn kho
        },
      },
    ]);

    // Kiểm tra kết quả
    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products); // Trả về danh sách sản phẩm
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAllProductBySearch = async (req, res) => {
  try {
    const { searchName } = req.query;

    // Tạo matchStage chỉ cho searchName
    let matchStage = {
      deleted: false,
      isHardDeleted: false,
    };

    // Nếu có searchName, thêm vào điều kiện lọc
    if (searchName) {
      matchStage.name = { $regex: new RegExp(searchName, "i") }; // Tìm kiếm không phân biệt hoa thường
    }

    // Pipeline aggregate để lấy sản phẩm
    const productsPipeline = [
      { $match: matchStage }, // Lọc sản phẩm chính theo điều kiện
      {
        $lookup: {
          from: "productvariantbases", // Tên collection của ProductVariantBase
          let: { productId: "$_id" }, // Biến productId để sử dụng trong pipeline
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productId", "$$productId"] }, // Khớp với productId
              },
            },
            {
              $match: {
                deleted: false,
                isHardDeleted: false, // Lọc biến thể không bị xóa
              },
            },
          ],
          as: "product_variants", // Tên trường chứa kết quả lookup
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
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          images: 1,
          status: 1,
          "product_variants.price": 1, // Bao gồm giá từ ProductVariantBase
          "product_variants.color": 1, // Thêm thuộc tính khác nếu cần
          "product_variants.stock_quantity": 1,
        },
      },
    ];

    // Lấy danh sách sản phẩm
    const products = await Product.aggregate(productsPipeline);

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found for this search criteria." });
    }

    res.status(200).json({ products }); // Trả về danh sách sản phẩm
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getDetailProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const data = await Product.findById(
      productId,
      { name: 1, images: 1, description: 1, brand: 1, category: 1 } // Chỉ lấy các trường cần thiết
    );

    const variant = await ProductVariantBase.findOne({
      productId: productId,
    }).populate({
      path: "productId",
      select: "name images description brand category",
      populate: [
        { path: "brand", select: "name" },
        { path: "category", select: "name" },
      ],
    });

    if (!variant) {
      return res.status(404).json({
        message: "Không tìm thấy biến thể với ID này",
        product: data,
        variants: [],
      });
    }

    // Lấy các biến thể cùng productId và có trường deleted = false
    const variantsWithSameProductId = await ProductVariantBase.find({
      productId: productId,
      deleted: false, // Thêm điều kiện lọc deleted: false
    });

    res.status(200).json({
      product: {
        _id: variant.productId._id,
        name: variant.productId.name,
        images: variant.productId.images,
        description: variant.productId.description,
        brand: variant.productId.brand,
        category: variant.productId.category,
      },
      variants: variantsWithSameProductId, // Chỉ các biến thể không bị xóa
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy sản phẩm", error: error.message });
  }
};

// CATEGORY
const getCategory = async (req, res) => {
  try {
    const category = await Category.find({
      deleted: false,
    });
    res.status(200).json({
      message: "Danh sách danh mục",
      category,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách danh mục" });
  }
};

// BRANDS
const getBrand = async (req, res) => {
  try {
    const brands = await Brand.find({
      deleted: false,
    }); // Lấy các trường cần thiết

    res.status(200).json({
      message: "Danh sách thương hiệu",
      brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách thương hiệu" });
  }
};

const getBrandsByName = async (req, res) => {
  try {
    const { category } = req.query;

    const categoriesWithBrands = await Category.aggregate([
      {
        $match: { name: new RegExp(category, "i") }, // Tìm category dựa trên tên
      },
      {
        $lookup: {
          from: "brands", // Join với collection 'brands'
          localField: "_id", // Dùng _id của category để nối
          foreignField: "category_id", // Liên kết với category_id của brand
          as: "brands", // Đặt kết quả vào field 'brands'
        },
      },
      {
        $unwind: "$brands",
      },
      {
        $group: {
          _id: "$brands.name", // Nhóm theo tên brand
          name: { $first: "$brands.name" }, // Lấy tên của brand
          categoryName: { $first: "$name" },
          image: { $first: "$brands.image" }, // Lấy image
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          categoryName: 1,
          image: 1,
        },
      },
    ]);

    if (categoriesWithBrands.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thương hiệu với name này" });
    }

    res.status(200).json({
      brands: categoriesWithBrands,
      message: "Danh sách các thương hiệu",
    });
  } catch (error) {
    console.error("Lỗi lấy brands bằng category", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBrandLaptop = async (req, res) => {
  try {
    const data = await Brand.aggregate([
      {
        $lookup: {
          from: "categories", // Join với collection 'categories'
          localField: "category_id", // Dùng category_id của brand để nối
          foreignField: "_id", // Liên kết với _id của category
          as: "categories", // Đặt kết quả vào field 'categories'
        },
      },
      {
        $unwind: {
          path: "$categories",
          preserveNullAndEmptyArrays: true, // Giữ lại các thương hiệu không có category
        },
      },
    ]);

    res.status(200).json("test"); // Gửi dữ liệu về cho client
  } catch (error) {
    console.error("Lỗi lấy dữ liệu thương hiệu laptop", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getDetailProduct,

  getAllProductBySearch,
  getCategory,
  getBrand,
  getBrandsByName,
  getBrandLaptop,
};

// Cần bổ sung thêm các middleware
