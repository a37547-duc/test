const axios = require("axios");
const crypto = require("crypto");
const Order = require("../../models/Order/OrderModel");
const {
  ProductVariantBase,
} = require("../../models/Products_Skus/productSkudModel");
const mongoose = require("mongoose");
const accessKey = "F8BBA842ECF85";
const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const partnerCode = "MOMO";

const handlePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      userId,
      products,
      totalAmount,
      shippingInfo,
      paymentMethod,
      email,
    } = req.body;

    // Tạo đơn hàng mới
    const newOrder = new Order({
      userId,
      email,
      products,
      totalAmount,
      shippingInfo,
      paymentMethod,
    });

    // Kiểm tra `stock_quantity` mà không cập nhật
    for (const product of products) {
      const { productId, quantity } = product;

      // Tìm sản phẩm theo ID
      const productVariant = await ProductVariantBase.findById({
        _id: productId,
      }).session(session);

      if (!productVariant) {
        throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
      }

      // Kiểm tra nếu số lượng không đủ
      if (productVariant.stock_quantity < quantity) {
        throw new Error(
          `Sản phẩm ${product.name} không đủ số lượng. Hiện chỉ còn ${productVariant.stock_quantity} trong kho.`
        );
      }
    }

    // Lưu đơn hàng vào cơ sở dữ liệu (chỉ khi tất cả sản phẩm đều đủ số lượng)
    const savedOrder = await newOrder.save({ session });

    // Xử lý thanh toán
    if (paymentMethod === "MoMo") {
      const redirectUrl = "http://localhost:5173";
      const ipnUrl =
        "https://84b3-2402-800-6173-f9a3-e4da-d8c1-a86b-98b5.ngrok-free.app/api/v1/callback";
      const orderInfo = "Thanh toán đơn hàng qua MoMo";
      const requestType = "captureWallet";
      const orderId = savedOrder._id.toString();
      const requestId = orderId;
      const extraData = "";

      const rawSignature = `accessKey=${accessKey}&amount=${totalAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "Laptech Store",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: totalAmount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: "vi",
        requestType: requestType,
        extraData: extraData,
        signature: signature,
      });

      // Gửi yêu cầu đến MoMo API
      const response = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Hoàn thành transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Đơn hàng đã được tạo. Vui lòng thanh toán qua MoMo.",
        paymentData: response.data,
        order: savedOrder,
      });
    } else if (paymentMethod === "COD") {
      // Hoàn thành transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: "Đơn hàng đã được tạo thành công!",
        data: savedOrder,
      });
    }
  } catch (error) {
    // Hủy transaction nếu có lỗi
    await session.abortTransaction();
    session.endSession();

    console.error("Lỗi khi tạo đơn hàng:", error.message);
    return res.status(400).json({
      message: "Không thể tạo đơn hàng",
      error: error.message,
    });
  }
};

const handleTransaction = async (req, res) => {
  const { orderId } = req.body;

  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${orderId}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: partnerCode,

    requestId: orderId,
    orderId: orderId,
    signature: signature,
    lang: "vi",
  });

  try {
    const response = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/query",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
    return res
      .status(200)
      .json({ message: "Trạng thái giao dịch ", data: response.data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

const handleCallback = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Call back response from MoMo:", req.body);

    const { orderId, resultCode, message } = req.body;

    // Tìm đơn hàng
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Đơn hàng không tồn tại." });
    }

    if (resultCode === 0) {
      // Thanh toán thành công
      order.paymentStatus = "Đã thanh toán";

      await order.save({ session });

      // Cập nhật stock_quantity
      for (const product of order.products) {
        const { productId, quantity } = product;

        // Tìm sản phẩm tương ứng
        const productVariant = await ProductVariantBase.findById({
          _id: productId,
        }).session(session);

        if (!productVariant) {
          throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
        }

        // Giảm số lượng sản phẩm trong kho
        if (productVariant.stock_quantity < quantity) {
          throw new Error(
            `Không đủ hàng cho sản phẩm ${product.name}. Số lượng còn lại: ${productVariant.stock_quantity}`
          );
        }

        productVariant.stock_quantity -= quantity;
        await productVariant.save({ session });
      }
    } else if (resultCode === 1006) {
      // Thanh toán thất bại hoặc bị hủy
      order.paymentStatus = "Thất bại";
      order.orderStatus = "Đã hủy";
      await order.save({ session });

      console.log("GIAO DỊCH BỊ HỦY BỞI NGƯỜI DÙNG");

      // Hoàn tác stock (cộng lại số lượng sản phẩm vào kho)
      for (const product of order.products) {
        const { productId, quantity } = product;

        const productVariant = await ProductVariantBase.findById({
          _id: productId,
        }).session(session);

        if (!productVariant) {
          throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
        }

        productVariant.stock_quantity += quantity; // Cộng lại số lượng
        await productVariant.save({ session });
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Lỗi thanh toán: " + message });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message:
        resultCode === 0 ? "Thanh toán thành công!" : "Thanh toán thất bại.",
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error in callback handling:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  handlePayment,
  handleCallback,
  handleTransaction,
};
