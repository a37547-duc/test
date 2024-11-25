const mongoose = require("mongoose");
const Product = require("../models/productModel");

const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");

const {
  ProductVariantBase,
} = require("../models/Products_Skus/productSkudModel");

const getAllProducts = async (req, res) => {
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
      {
        $addFields: {
          product_variants_filtered: {
            $filter: {
              input: "$product_variants",
              as: "variant",
              cond: { $gt: ["$$variant.stock_quantity", 0] },
            },
          },
        },
      },
      {
        $addFields: {
          product_variants: { $arrayElemAt: ["$product_variants_filtered", 0] },
        },
      },
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
              else: "$status",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          images: 1,
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

    res.status(200).json(products); // Trả về danh sách sản phẩm
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDetailProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Tìm biến thể dựa trên productId và populate các thông tin liên quan
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
      return res
        .status(404)
        .json({ message: "Không tìm thấy biến thể với ID này" });
    }

    const variantsWithSameProductId = await ProductVariantBase.find({
      productId: productId,
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
    // Lấy danh sách tất cả thương hiệu mà không cần populate
    const brands = await Brand.find({}); // Lấy các trường cần thiết

    res.status(200).json(brands);
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

  getCategory,
  getBrand,
  getBrandsByName,
  getBrandLaptop,
};

// Cần bổ sung thêm các middleware
