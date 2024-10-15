const mongoose = require("mongoose");

const MongooseDelete = require("mongoose-delete");

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
  image: { type: String, required: true },
  isHardDeleted: { type: Boolean, default: false }, // Trường xóa cứng
});

brandSchema.plugin(MongooseDelete, {
  overrideMethods: [
    "count",
    "find",
    "findOne",
    "update",
    "countDocuments",
    "countDocumentsDeleted",
    "countDocumentsWithDeleted",
    "countDeleted",
  ],
  deletedAt: true,
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
