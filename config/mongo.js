const mongoose = require("mongoose");
const uri =
  "mongodb+srv://anhtupeo1234:bacdaibang1897@chuyendetn.eio4t.mongodb.net/?retryWrites=true&w=majority&appName=ChuyenDeTN";

async function connectToDatabase() {
  try {
    // Kết nối tới MongoDB bằng Mongoose
    await mongoose.connect(uri, {});
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (err) {
    console.error("Error connecting to MongoDB Atlas:", err);
  }
}

module.exports = { connectToDatabase };
