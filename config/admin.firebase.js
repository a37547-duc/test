const admin = require("firebase-admin");

const serviceAccount = require("D:/A37547-ChuyendeTN/bai1/config/chuyendetn-43b4d-firebase-adminsdk-n6bg5-457fec611b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
