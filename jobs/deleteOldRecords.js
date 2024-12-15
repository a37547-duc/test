const cron = require("node-cron");
const axios = require("axios");

// Hàm checkHealth: Gửi yêu cầu đến chính server
const checkHealth = async () => {
  try {
    const response = await axios.get("https://laptech4k.onrender.com/health");
    console.log("Health check successful:", response.status);
  } catch (error) {
    console.error("Health check failed:", error.message);
  }
};

// Lên lịch chạy mỗi 10 phút
cron.schedule("*/10 * * * *", () => {
  checkHealth();
  console.log("Health check request sent at:", new Date().toLocaleString());
});
