const axios = require("axios");
const crypto = require("crypto");
const Order = require("../../models/Order/OrderModel");
const { getNgrokUrl } = require("../../config/ngrok");

const accessKey = "F8BBA842ECF85";
const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const partnerCode = "MOMO";

const handlePayment = async (req, res) => {
  const newOrder = new Order(req.body);

  const savedOrder = await newOrder.save();

  if (savedOrder.paymentMethod == "MoMo") {
    console.log("Thanh toán bằng momo");
    const redirectUrl = "http://localhost:5173";
    // const ipnUrl = `${getNgrokUrl()}/api/v1/callback`;
    const ipnUrl = `great-tetra-vocal.ngrok-free.app/api/v1/callback`;
    var orderInfo = "pay with MoMo";
    var requestType = "captureWallet";
    var amount = savedOrder.totalAmount;
    var orderId = savedOrder.id;
    var requestId = orderId;
    var extraData = "";

    var autoCapture = true;
    var lang = "vi";

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&partnerCode=" +
      partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      requestId +
      "&requestType=" +
      requestType;

    var signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");
    console.log("--------------------SIGNATURE----------------");

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      signature: signature,
    });

    try {
      const response = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res
        .status(200)
        .json({ message: "Thông tin thanh toán: ", data: response.data });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Lỗi server", error: error.message });
    }
  } else {
    try {
      return res.status(200).json({
        message: "Thông tin đã được lưu vào cơ sở dữ liệu: ",
        data: savedOrder,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Lỗi server", error: error.message });
    }
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

  //    axios
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
  try {
    console.log("Call back response from MoMo:", req.body);

    const { orderId, resultCode, message } = req.body;

    if (resultCode === 0) {
      // Thành công
      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: "Đã thanh toán" },
        { new: true }
      );

      if (!order) {
        return res.status(400).json({ message: "Đơn hàng không tồn tại." });
      }
      return res.status(200).json({ message: "Thanh toán thành công!", order });
    } else if (resultCode === 1006) {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: "Thất bại", orderStatus: "Đã hủy" },
        { new: true }
      );
      console.log("Đã xử lý hủy trạng thía", order);
      if (!order) {
        return res.status(400).json({ message: "Đơn hàng không tồn tại." });
      }

      return res.status(200).json({ message: "Thanh toán thất bại.", order });
    } else {
      return res.status(400).json({ message: "Lỗi thanh toán: " + message });
    }
  } catch (error) {
    console.error("Error in callback handling:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  handlePayment,
  handleCallback,
  handleTransaction,
};
