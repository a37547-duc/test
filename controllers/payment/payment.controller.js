const axios = require("axios");
const crypto = require("crypto");
const Order = require("../../models/Order/OrderModel");
const { getNgrokUrl } = require("../../config/ngrok");

const accessKey = "F8BBA842ECF85";
const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const partnerCode = "MOMO";

var redirectUrl = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
var ipnUrl = `${getNgrokUrl()}/api/v1/callback`;

const handlePayment = async (req, res) => {
  try {
    // Lưu đơn hàng mới
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // Kiểm tra phương thức thanh toán
    if (savedOrder.paymentMethod === "MoMo") {
      console.log("Thanh toán bằng MoMo");

      // Khai báo các tham số cho thanh toán qua MoMo
      const accessKey = "F8BBA842ECF85";
      const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      const partnerCode = "MOMO";
      const redirectUrl = "https://webhook.site/your-redirect-url";
      const ipnUrl = "https://your-ngrok-url/api/v1/callback";
      const orderInfo = "pay with MoMo";
      const requestType = "captureWallet";
      const amount = savedOrder.totalAmount.toString();
      const orderId = savedOrder.id;
      const requestId = orderId;
      const extraData = "";
      const lang = "vi";
      const autoCapture = true;

      // Tạo chữ ký HMAC SHA256
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      const crypto = require("crypto");
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      // Đối tượng JSON gửi tới MoMo endpoint
      const requestBody = {
        partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang,
        requestType,
        autoCapture,
        extraData,
        signature,
      };

      // Gửi yêu cầu đến MoMo
      const response = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        requestBody,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Trả về thông tin thanh toán
      return res
        .status(200)
        .json({ message: "Thông tin thanh toán: ", data: response.data });
    } else if (savedOrder.paymentMethod === "Thanh toán khi nhận hàng") {
      console.log("Thanh toán khi nhận hàng");

      // Nếu thanh toán khi nhận hàng, chỉ cần trả về thông báo đơn hàng đã được tạo
      return res.status(200).json({
        message: "Đơn hàng đã được tạo, vui lòng thanh toán khi nhận hàng.",
        order: savedOrder,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không được hỗ trợ" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
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
  //  Bên trong này sẽ xử lý cập nhật order
  console.log("call back");
  console.log(req.body);
  res.status(200).json(req.body);
};
module.exports = {
  handlePayment,
  handleCallback,
  handleTransaction,
};
