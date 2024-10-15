const express = require("express");
const { connectToDatabase } = require("./config/mongo");

const productRoutes = require("./routes/product.route");
const adminRoutes = require("./routes/Admin/admin.products.route");

// const Product = require("./models/productModel");
const Category = require("./models/categoryModel");
const Brand = require("./models/brandModel");
const UseCase = require("./models/usecaseModel");
// const ProductVariant = require("./models/Products_Skus/productSkudModel");

const app = express();
app.use(express.json());

// Cấu hình cors
const cors = require("cors");
require("./jobs/deleteOldRecords");
app.use(
  cors({
    origin: "http://localhost:5173", // Hoặc một số domain bạn cho phép
  })
);

// Route để tạo Category
// app.post("/category/create", async (req, res) => {
//   try {
//     const { name, description } = req.body;

//     // Tạo một Category mới
//     const newCategory = new Category({
//       name,
//       description,
//     });

//     const savedCategory = await newCategory.save();

//     res.status(201).json({
//       message: "Category created successfully",
//       category: savedCategory,
//     });
//   } catch (error) {
//     console.error("Error creating category:", error.message);
//     res.status(500).json({ message: "Failed to create category" });
//   }
// });

// Route để tạo Brand
app.post("/brand/create", async (req, res) => {
  try {
    const { name, category_id, description } = req.body;

    // Tạo một Brand mới
    const newBrand = new Brand({
      name,
      category_id: category_id,
      description,
    });

    // Lưu vào cơ sở dữ liệu
    const savedBrand = await newBrand.save();

    res.status(201).json({
      message: "Brand created successfully",
      brand: savedBrand,
    });
  } catch (error) {
    console.error("Error creating brand:", error.message);
    res.status(500).json({ message: "Failed to create brand" });
  }
});

// Route tạo use_case

app.post("/use_case/create", async (req, res) => {
  try {
    const { name, description } = req.body;

    // Tạo một Use Case mới
    const newUseCase = new UseCase({
      name,
      description,
    });

    // Lưu vào cơ sở dữ liệu
    const savedUseCase = await newUseCase.save();

    // Phản hồi lại client với thông tin của Use Case đã lưu
    res.status(201).json(savedUseCase);
  } catch (error) {
    // Trả về lỗi nếu quá trình lưu gặp vấn đề
    res.status(500).json({
      message: error.message,
    });
  }
});

///////////////////////////// Route sử dụng thực tế

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/admin/products", adminRoutes);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:" + 3000);
  connectToDatabase();
});

// HÀM TEST
// async function insertSampleData() {
//   try {
//     // Tạo danh sách các hình ảnh mẫu
//     const images = [
//       {
//         url: "https://firebasestorage.googleapis.com/v0/b/chuyendetn-43b4d.appspot.com/o/images%2FBIDV-DO%20MINH%20DUC-V3CAS1243131123.png?alt=media&token=c2a6eb70-f881-48f3-a28f-4cd48553950c",
//       },
//       {
//         url: "https://firebasestorage.googleapis.com/v0/b/chuyendetn-43b4d.appspot.com/o/images%2Fbeb0044ea753010d5842.jpg?alt=media&token=9e3c50d9-0f7f-4839-a29a-ad79e0922005",
//       },
//     ];

//     // Thêm hình ảnh vào MongoDB
//     const imageDocs = await Image.insertMany(images);
//     console.log("Images added:", imageDocs);

//     // Tạo danh sách các danh mục (categories) mẫu
//     const categories = [
//       { name: "Gaming" },
//       { name: "Office" },
//       { name: "Business" },
//     ];

//     // Thêm các danh mục vào MongoDB
//     const categoryDocs = await Category.insertMany(categories);
//     console.log("Categories added:", categoryDocs);

//     // Tạo danh sách các thương hiệu (brands) mẫu
//     const brands = [
//       { name: "Dell" },
//       { name: "Acer" },
//       { name: "Macbook Pro" },
//     ];

//     // Thêm các thương hiệu vào MongoDB
//     const brandDocs = await Brand.insertMany(brands);
//     console.log("Brands added:", brandDocs);

//     // Tạo danh sách GPU mẫu
//     const gpus = [
//       {
//         name: "RTX 3060",
//         manufacturer: "NVIDIA",
//         memory: { size: "12GB", type: "GDDR6" },
//         type: "discrete",
//       },
//       {
//         name: "RX 6700 XT",
//         manufacturer: "AMD",
//         memory: { size: "12GB", type: "GDDR6" },
//         type: "discrete",
//       },
//     ];

//     // Thêm GPU vào MongoDB
//     const gpuDocs = await Gpu.insertMany(gpus);
//     console.log("GPUs added:", gpuDocs);

//     // Tạo danh sách sản phẩm (products) mẫu
//     const products = [
//       {
//         name: "MacBook Pro 16",
//         description: "Powerful laptop from Apple with M1 chip.",
//         price: 2500,
//         category: categoryDocs.find((cat) => cat.name === "Gaming")._id,
//         brand: brandDocs.find((brand) => brand.name === "Macbook Pro")._id,
//         images: imageDocs.map((image) => image._id),
//       },
//       {
//         name: "Dell XPS 13",
//         description: "High-end laptop from Dell.",
//         price: 1500,
//         category: categoryDocs.find((cat) => cat.name === "Office")._id,
//         brand: brandDocs.find((brand) => brand.name === "Dell")._id,
//         images: [imageDocs[0]._id],
//       },
//     ];

//     // Thêm sản phẩm vào MongoDB
//     const productDocs = await Product.insertMany(products);
//     console.log("Products added:", productDocs);

//     const productVariants = [
//       {
//         productId: productDocs[0]._id, // MacBook Pro 16
//         color: "Black",
//         ram: "32GB",
//         storage: "512GB SSD",
//         gpu: gpuDocs.find((gpu) => gpu.name === "RX 6700 XT")._id,
//         price: 2500,
//         stock_quantity: 5,
//       },
//       {
//         productId: productDocs[1]._id, // Dell XPS 13
//         color: "Black",
//         ram: "16GB",
//         storage: "512GB SSD",
//         gpu: gpuDocs.find((gpu) => gpu.name === "RX 6700 XT")._id,
//         price: 1500,
//         stock_quantity: 3,
//       },
//     ];

//     // Thêm biến thể sản phẩm vào MongoDB
//     const productVariantDocs = await ProductVariant.insertMany(productVariants);
//     console.log("Product variants added:", productVariantDocs);
//   } catch (error) {
//     console.error("Error inserting sample data:", error);
//   }
// }

// async function getProductById(productId) {
//   try {
//     // Tìm sản phẩm theo _id và populate các trường cần thiết
//     const product = await Product.findById(productId)
//       .populate("category", "name -_id")
//       .populate("brand", "name -_id")
//       .populate("images");

//     if (!product) {
//       console.log("Product not found");
//       return null;
//     }

//     // In ra sản phẩm
//     console.log("Product Details:", product);
//     return product;
//   } catch (error) {
//     console.error("Error fetching product:", error);
//   }
// }

// async function getProductVariantsByProductId(productId) {
//   try {
//     // Tìm kiếm các biến thể sản phẩm theo productId
//     const variants = await ProductVariant.find({ productId: productId })
//       .populate("gpu", "name manufacturer memory")
//       .populate("productId", "name");

//     if (variants.length === 0) {
//       console.log("No product variants found for the given product ID.");
//       return [];
//     }

//     // In ra các biến thể sản phẩm
//     console.log("Product Variants:", variants);
//     return variants;
//   } catch (error) {
//     console.error("Error fetching product variants:", error);
//     return [];
//   }
// }

// app.post("/products/create", async (req, res) => {
//   try {
//     const { name, description, price, category, brand, images } = req.body;

//     // Tạo sản phẩm mới
//     const product = new Product({
//       name,
//       description,
//       price,
//       category,
//       brand,
//       images,
//     });

//     const savedProduct = await product.save();
//     res.status(201).json(savedProduct);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// const addProductVariant = async (req, res) => {
//   try {
//     const productId = req.params.id; // ID của sản phẩm chính từ URL
//     const variantData = req.body; // Dữ liệu của variant từ body của yêu cầu

//     // Kiểm tra xem sản phẩm chính có tồn tại không
//     const productExists = await Product.findById(productId);
//     if (!productExists) {
//       return res
//         .status(404)
//         .json({ message: "Không tìm thấy sản phẩm chính với ID này" });
//     }

//     // Tạo một sản phẩm variant mới
//     const newVariant = new ProductVariant({
//       productId: productId, // Liên kết với sản phẩm chính
//       ...variantData, // Các trường khác từ dữ liệu variant
//     });

//     // Lưu sản phẩm variant vào cơ sở dữ liệu
//     const savedVariant = await newVariant.save();

//     return res.status(201).json({
//       message: "Thêm sản phẩm variant thành công",
//       variant: savedVariant,
//     });
//   } catch (error) {
//     console.error("Lỗi thêm sản phẩm variant:", error);
//     return res
//       .status(500)
//       .json({ message: "Đã xảy ra lỗi khi thêm sản phẩm variant" });
//   }
// };

// app.post("/variants/:id", addProductVariant);
