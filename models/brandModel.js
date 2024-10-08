const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    require: true,
  },
});

const Brand = mongoose.model("Brand", brandSchema);
module.exports = Brand;
