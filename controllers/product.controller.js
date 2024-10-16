const mongoose = require("mongoose");
const Product = require("../models/productModel");

const ProductVariant = require("../models/Products_Skus/productSkudModel");

const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const Usecase = require("../models/usecaseModel");
const {
  ProductVariantBase,
} = require("../models/Products_Skus/productSkudModel");

// const getAllProducts = async (req, res) => {
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
//                 in: { $eq: ["$$variant.stock_quantity", 0] }, // Kiểm tra nếu stock_quantity = 0
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
//             }, // Cập nhật trạng thái sản phẩm
//           },
//         },
//       },
//       {
//         $addFields: {
//           product_variants: { $arrayElemAt: ["$product_variants", 0] }, // Lấy phần tử đầu tiên của product_variants
//         },
//       },
//       {
//         $project: {
//           name: 1,
//           price: 1,
//           images: 1,
//           status: 1,
//           "category.name": 1,

//           "brand.name": 1,

//           "use_cases.name": 1,

//           product_variants: 1,
//         },
//       },
//     ]);

//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getAllProducts = async (req, res) => {
  try {
    const { category, brand, usecase } = req.query;

    const matchFilters = {};
    console.log(usecase);
    if (category) {
      const categoryData = await Category.findOne({
        name: new RegExp(category, "i"),
      });

      if (categoryData) {
        matchFilters["category._id"] = categoryData._id;
      }
    }

    if (usecase) {
      const usecaseData = await Usecase.findOne({
        name: new RegExp(usecase, "i"),
      });
      console.log(usecaseData);

      if (usecaseData) {
        matchFilters["use_cases._id"] = usecaseData._id;
      }
    }

    if (brand) {
      const brandData = await Brand.findOne({
        name: new RegExp(brand, "i"),
      });

      if (brandData) {
        matchFilters["brand._id"] = brandData._id;
      }
    }

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
    //                 in: { $eq: ["$$variant.stock_quantity", 0] }, // Kiểm tra nếu stock_quantity = 0
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
    //             }, // Cập nhật trạng thái sản phẩm
    //           },
    //         },
    //       },
    //       {
    //         $addFields: {
    //           product_variants: { $arrayElemAt: ["$product_variants", 0] },
    //         },
    //       },
    //       {
    //         $match: matchFilters,
    //       },

    //       {
    //         $project: {
    //           name: 1,
    //           price: 1,
    //           images: 1,
    //           status: 1,
    //           "category.name": 1,
    //           "category._id": 1,
    //           "brand.name": 1,
    //           "brand._id": 1,
    //           "use_cases.name": 1,
    //           "use_cases._id": 1,
    //           product_variants: 1,
    //         },
    //       },
    //     ]);

    //     res.status(200).json(products);
    //   } catch (error) {
    //     res.status(500).json({ error: error.message });
    //   }
    // };

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
        $unwind: "$use_cases",
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
        $addFields: {
          product_variants: { $arrayElemAt: ["$product_variants", 0] },
        },
      },
      {
        $match: matchFilters,
      },
      {
        $facet: {
          mice: [
            { $match: { type: "MouseVariant" } }, // Lọc ra sản phẩm MouseVariant
            { $limit: 20 },
          ],
          laptops: [
            { $match: { type: "LaptopVariant" } }, // Lọc ra sản phẩm LaptopVariant
            { $limit: 20 },
          ],
        },
      },

      {
        $project: {
          mice: {
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
            stock_quantity: "$product_variants.stock_quantity",
          },
          laptops: {
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
            stock_quantity: "$product_variants.stock_quantity",
          },
        },
      },

      // {
      //   $project: {
      //     name: 1,
      //     price: 1,
      //     images: 1,
      //     status: 1,
      //     type: 1,
      //     "category.name": 1,
      //     "category._id": 1,
      //     "brand.name": 1,
      //     "brand._id": 1,
      //     "use_cases.name": 1,
      //     "use_cases._id": 1,
      //     product_variants: 1,
      //   },
      // },
    ]);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVariantData = (variant) => {
  switch (variant.type) {
    case "LaptopVariant":
      return {
        _id: variant._id,
        color: variant.color,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
        gpu: variant.gpu,
        cpu: variant.cpu,
        ram: variant.ram,
        storage: variant.storage,
        type: variant.type,
      };
    case "MouseVariant":
      return {
        _id: variant._id,
        color: variant.color,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
        dpi: variant.dpi, // dpi
        sensor: variant.sensor, // sensor
        weight: variant.weight, // weight
        wireless: variant.wireless,
        color: variant.color,
        rgb_lighting: variant.rgb_lighting,
        battery_life: variant.battery_life,
        type: variant.type,
        ...(variant.wireless && { battery_life: variant.battery_life }),
      };

    default:
      return {
        _id: variant._id,
        color: variant.color,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
      };
  }
};

// const getDetailProduct = async (req, res) => {
//   try {
//     const _id = req.params.id;
//     const variant = await ProductVariantBase.findOne({ _id }).populate(
//       "productId",
//       "name images description"
//     );

//     if (!variant) {
//       return res
//         .status(404)
//         .json({ message: "Không tìm thấy biến thể với id này" });
//     }

//     // Tìm các biến thể có cùng productId
//     const variantsWithSameProductId = await ProductVariantBase.find(
//       {
//         productId: variant.productId._id,
//       },
//       "_id cpu.name gpu.name"
//     );

//     res.status(200).json({
//       product: {
//         _id: variant.productId._id,
//         name: variant.productId.name,
//         images: variant.productId.images,
//         description: variant.productId.description,
//       },
//       variants: variantsWithSameProductId,
//     });
//   } catch (error) {
//     console.error("Lỗi khi lấy sản phẩm:", error);
//     res
//       .status(500)
//       .json({ message: "Lỗi khi lấy sản phẩm", error: error.message });
//   }
// };

const getDetailProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const variant = await ProductVariantBase.findOne({
      _id: productId,
    }).populate("productId", "name images description");

    if (!variant) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy biến thể với id này" });
    }

    const variantsWithSameProductId = await ProductVariantBase.find(
      {
        productId: variant.productId._id,
      },
      "_id cpu.name gpu.name"
    );

    res.status(200).json({
      product: {
        _id: variant.productId._id,
        name: variant.productId.name,
        images: variant.productId.images,
        description: variant.productId.description,
      },
      variants: variantsWithSameProductId,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy sản phẩm", error: error.message });
  }
};

const getCategory = async (req, res) => {
  const data = await Category.find({});
  res.status(200).json(data);
};

const getBrand = async (req, res) => {
  try {
    const brands = await Brand.find().populate({
      path: "category_id",
      select: "name",
    });

    res.status(200).json(brands);
  } catch (error) {
    console.error("Error fetching brands with category name:", error);
    throw error;
  }
};

// const getBrandsByName = async (req, res) => {
//   try {
//     const { name } = req.query;
//     console.log(name);

//     // Sử dụng aggregate để tìm category theo name và join với brands
//     const categoriesWithBrands = await Category.aggregate([
//       {
//         $match: { name: new RegExp(name, "i") }, // Tìm category dựa trên tên
//       },
//       {
//         $lookup: {
//           from: "brands", // Join với collection 'brands'
//           localField: "_id", // Dùng _id của category để nối
//           foreignField: "category_id", // Liên kết với category_id của brand
//           as: "brands", // Đặt kết quả vào field 'brands'
//         },
//       },
//       {
//         $unwind: "$brands", // Nếu bạn muốn tách từng brand riêng lẻ, nếu không thì bỏ dòng này
//       },
//       {
//         $project: {
//           "brands._id": 1,
//           "brands.name": 1,
//           "brands.category_id": 1,
//         },
//       },
//     ]);

//     if (categoriesWithBrands.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No category or brands found with this name" });
//     }

//     res
//       .status(200)
//       .json({ brands: categoriesWithBrands, message: "Brands found" });
//   } catch (error) {
//     console.error("Lỗi lấy brands bằng category", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

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

  getCategory,
  getBrand,
  getBrandsByName,
  getBrandLaptop,
};

// Cần bổ sung thêm các middleware
