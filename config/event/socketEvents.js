module.exports = (socket, io) => {
  // Khi admin kết nối, thêm vào room "admins"
  socket.on("registerAdmin", (adminId) => {
    // Thêm socket vào room "admins"
    socket.join("admins");
    console.log(`Admin connected: ${adminId} with socketId: ${socket.id}`);
  });

  // Gửi thông báo tới tất cả admin đã đăng ký
  socket.on("sendNotification", (data) => {
    console.log("ĐÃ GỬI THÔNG BÁO: ", data);

    // Phát thông báo tới tất cả các socket trong room "admins"
    io.to("admins").emit("receiveNotification", data);
    console.log(`Notification sent to all admins in room "admins"`);
  });

  // Lắng nghe sự kiện ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
};
