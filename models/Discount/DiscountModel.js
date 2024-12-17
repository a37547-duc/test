const mongoose = require("mongoose");
const discountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage",
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const Discount = mongoose.model("Discount", discountSchema);

module.exports = Discount;
