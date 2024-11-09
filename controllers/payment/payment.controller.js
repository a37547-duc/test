const axios = require("axios");
const crypto = require("crypto");
const accessKey = "F8BBA842ECF85";
const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const partnerCode = "MOMO";

const handlePayment = async (req, res) => {
  var orderInfo = "pay with MoMo11";

  var redirectUrl = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
  var ipnUrl = "https://8ac4-117-5-74-107.ngrok-free.app/api/v1/callback";
  var requestType = "captureWallet";
  var amount = "10000";
  var orderId = partnerCode + new Date().getTime();
  var requestId = orderId;
  var extraData = "";
  const items = [
    {
      id: "1",
      name: "Laptop Dell XPS 13",
      price: 15000000,
      image:
        "https://firebasestorage.googleapis.com/v0/b/chuyendetn-43b4d.appspot.com/o/images%2F77021_laptop_lenovo_ideapad_3_16iah8__83bg001xvn___2_.jpg?alt=media&token=30f17067-5139-48e6-9735-08a419f11933",
      quantity: 5,
      description:
        "Laptop Dell XPS 13 với màn hình 13 inch, Intel i7, RAM 16GB, SSD 512GB",
    },
    {
      id: "2",
      name: "Chuột Logitech MX Master 3",
      price: 2000000,
      image:
        "https://firebasestorage.googleapis.com/v0/b/chuyendetn-43b4d.appspot.com/o/images%2F77021_laptop_lenovo_ideapad_3_16iah8__83bg001xvn___2_.jpg?alt=media&token=30f17067-5139-48e6-9735-08a419f11933",
      quantity: 10,
      description:
        "Chuột không dây Logitech MX Master 3 với công nghệ Darkfield, DPI cao",
    },
  ];

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
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);
  //signature

  var signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
  console.log("--------------------SIGNATURE----------------");
  console.log(signature);

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
    items: items,
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
