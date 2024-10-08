const mongoose = require("mongoose");

// Model này dùng để xác định dạng của laptop đó là gì: Gaming, Office,...

const useCaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

const UseCase = mongoose.model("UseCase", useCaseSchema);

module.exports = UseCase;
