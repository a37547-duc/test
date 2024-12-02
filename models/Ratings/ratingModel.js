const mongoose = require("mongoose");
const moment = require("moment-timezone");
const ratingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      get: (date) =>
        moment(date)
          .tz("Asia/Ho_Chi_Minh")
          .locale("vi")
          .format("DD MMMM, YYYY HH:mm"),
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
