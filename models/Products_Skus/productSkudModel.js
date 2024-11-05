const mongoose = require("mongoose");
const Product = require("../productModel");
const productVariantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  color: {
    type: String,
  },

  gpu: {
    name: {
      type: String,
      required: [true, "Cần cung cấp tên GPU"],
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    manufacturer: {
      type: String,
      required: [true, "Cần cung cấp hãng sản xuất"],
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    memory: {
      size: {
        type: String,
        required: true, // Bắt buộc phải có dung lượng bộ nhớ "6GB, 8GB,..."
      },
      type: {
        type: String,
        required: true, // Bắt buộc phải có loại bộ nhớ
      },
    },
    type: {
      type: String,
      enum: ["discrete", "integrated"], // Có thể là card rời hoặc tích hợp
      required: true, // Bắt buộc phải có loại card
    },
  },

  cpu: {
    // Loại Cpu
    name: {
      // Tên của CPU, ví dụ: AMD Ryzen AI
      type: String,
      required: true,
      trim: true,
    },
    cores: {
      // Số lượng lõi của CPU
      type: Number,
      required: true,
    },
    threads: {
      // Số luồng của CPU
      type: Number,
      required: true,
    },
  },

  storage: {
    type: String,
    require: true,
  },
  ram: {
    capacity: {
      type: String, // Ví dụ: "32GB", dung lượng ram
      required: true,
    },
    type: {
      type: String, // Ví dụ: "LPDDR5X", loại ram
      required: true,
    },
  },

  // ///////////////////
  price: {
    type: Number,
    required: true,
  },
  stock_quantity: {
    type: Number,
    default: 0,
    min: [0, "San pham khong duoc am"], // Đảm bảo số lượng không âm
  },
});

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);
module.exports = ProductVariant;

// CODE SỬ DỤNG
const productVariantBaseSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    stock_quantity: {
      type: Number,
      default: 0,
      min: [0, "Sản phẩm không được âm"],
    },
  },
  { discriminatorKey: "type" }
);

const ProductVariantBase = mongoose.model(
  "ProductVariantBase",
  productVariantBaseSchema
);

// Tạo schema cho biến thể Laptop
const laptopVariantSchema = new mongoose.Schema({
  gpu: {
    name: {
      type: String,
      required: [true, "Cần cung cấp tên GPU"],
      trim: true,
    },
  },
  cpu: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cores: {
      type: Number,
      required: true,
    },
    threads: {
      type: Number,
      required: true,
    },
  },
  storage: {
    type: String,
    required: true,
  },
  ram: {
    capacity: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
});

const LaptopVariant = ProductVariantBase.discriminator(
  "LaptopVariant",
  laptopVariantSchema
);

const mouseVariantSchema = new mongoose.Schema({
  dpi: {
    // chỉ số đo độ nhạy của chuột cảm biến
    type: Number,
    required: true,
  },
  sensor: {
    type: String,
    required: [true, "Cần cung cấp loại cảm biến"],
    enum: ["optical", "laser"], // Cảm biến quang hoặc laser
  },
  weight: {
    type: Number,
    required: true, // Trọng lượng của chuột, tính bằng gram
  },
  buttons: {
    type: Number,
    required: true, // Số lượng nút trên chuột
  },
  wireless: {
    type: Boolean,
    required: true, // Chuột có phải là không dây hay không
  },
  battery_life: {
    type: String, // Thời lượng pin nếu là chuột không dây
    required: function () {
      return this.wireless; // Thời lượng pin chỉ yêu cầu nếu chuột là không dây
    },
  },
  color: {
    type: String, // Màu sắc của chuột
  },
  rgb_lighting: {
    type: Boolean, // Có đèn RGB hay không
    default: false,
  },
});

const MouseVariant = ProductVariantBase.discriminator(
  "MouseVariant",
  mouseVariantSchema
);

// Xuất mô hình
module.exports = {
  ProductVariantBase,
  LaptopVariant,
  MouseVariant,
};
