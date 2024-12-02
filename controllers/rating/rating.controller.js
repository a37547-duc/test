const mongoose = require("mongoose");
const Rating = require("../../models/Ratings/ratingModel");
const Product = require("../../models/productModel");

const postRating = async (req, res) => {
  console.log("THÔNG TIN TRẢ VỀ TỪ REQ: ", req.user);
  try {
    const { productId, rating, comment } = req.body;

    // Kiểm tra đầu vào
    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: "productId, userId, and rating are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Tạo một đánh giá mới và lưu vào collection Rating
    const newRating = await Rating.create({
      productId,
      userId: req.user.id,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Rating added successfully.",
      data: newRating,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the rating.",
      error: error.message,
    });
  }
};

const getRating = async (req, res) => {
  console.log("THÔNG TIN TRẢ VỀ TỪ REQ: ", req.user);
  try {
    const { productId, rating, comment } = req.body;

    // Kiểm tra đầu vào
    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: "productId, userId, and rating are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Tạo một đánh giá mới và lưu vào collection Rating
    const newRating = await Rating.create({
      productId,
      userId: req.user.id,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Rating added successfully.",
      data: newRating,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the rating.",
      error: error.message,
    });
  }
};

module.exports = {
  getRating,
  postRating,
};
