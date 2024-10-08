const Product = require("../models/productModel");

const ProductVariant = require("../models/Products_Skus/productSkudModel");

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
          product_variants: { $arrayElemAt: ["$product_variants", 0] }, // Lấy phần tử đầu tiên của product_variants
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          images: 1,
          status: 1,
          "category.name": 1,

          "brand.name": 1,

          "use_cases.name": 1,

          product_variants: 1,
        },
      },
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

const getDetailProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(productId);

    const variants = await ProductVariantBase.find({ productId }).populate(
      "productId",
      "name images description"
    );

    if (!variants || variants.length === 0) {
      console.log("Id này chưa có sản phẩm nào");
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm với id này" });
    }

    // Lấy thông tin sản phẩm chính
    const productDetails = {
      _id: variants[0].productId._id,
      name: variants[0].productId.name,
      images: variants[0].productId.images,
      description: variants[0].productId.description,
    };

    const response = {
      product: productDetails,
      variants: variants.map(getVariantData),
    };

    // Trả về danh sách biến thể cùng với chi tiết sản phẩm
    res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi lấy variants sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy variants sản phẩm", error: error.message });
  }
};

const getCategory = async (req, res) => {
  const data = await Category.find({});
  res.status(200).json(data);
};

const getBrand = async (req, res) => {
  const data = await Brand.find({});
  res.status(200).json(data);
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

module.exports = {
  getAllProducts,
  getDetailProduct,
  getCategory,
  getBrand,
  getBrandsByCategoryId,
};

// Cần bổ sung thêm các middleware
