const Order = require("../../models/Order/OrderModel");

//   try {
//     const orders = await Order.find({});
//     if (!orders || orders.length == 0) {
//       return res.status(404).json({ message: "Không có đơn hàng nào " });
//     }
//     res.status(200).json({
//       data: orders,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error });
//   }
// });

const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    if (!orders || orders.length == 0) {
      return res.status(404).json({ message: "Không có đơn hàng nào " });
    }
    res.status(200).json({
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error });
  }
};

// const updateAdminOrder = async (req, res) => {
//   const { id } = req.params;
//   const { orderStatus } = req.body;

//   try {
//     const order = await Order.findByIdAndUpdate(
//       id,
//       { orderStatus },
//       {
//         new: true,
//       }
//     );
//     if (!order) {
//       res.status(404).json({ message: "Không tìm thấy đơn hàng" });
//     }
//     res.status(200).json({ message: "Thông tin đơn hàng đã cập nhật", order });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const updateAdminOrder = async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  try {
    const update = { orderStatus };
    if (orderStatus === "Giao hàng thành công") {
      update.paymentStatus = "Đã thanh toán";
    }

    const order = await Order.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    res.status(200).json({ message: "Thông tin đơn hàng đã cập nhật", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminOrders,
  updateAdminOrder,
};
