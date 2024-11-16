require("dotenv").config();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const nonSecurePaths = ["/logout", "/login", "/register"];

const createJWT = (payload) => {
  // const key = process.env.JWT_SECRET;
  const key = "zero02";
  console.log("Xin chao:", payload);
  let token = null;
  try {
    token = jwt.sign(payload, key, {
      // expiresIn: process.env.JWT_EXPIRES_IN,
      expiresIn: "10m",
    });
  } catch (err) {
    console.log(err);
  }
  return token;
};

const verifyToken = (token) => {
  // let key = process.env.JWT_SECRET;
  let key = "zero02";
  let decoded = null;
  console.log("Verfify: ", token);
  try {
    decoded = jwt.verify(token, key);
  } catch (err) {
    console.log(err);
  }
  return decoded;
};

const extractToken = (req) => {
  const authHeader = req.headers["authorization"].split(" ")[1];

  return authHeader;
};

const checkUserJWT = (req, res, next) => {
  if (nonSecurePaths.includes(req.path)) return next();

  // Lấy token từ header
  let tokenFromHeader = extractToken(req);

  if (tokenFromHeader) {
    let access_token = tokenFromHeader;
    let decoded = verifyToken(access_token);

    if (decoded) {
      console.log("Sau khi mã hóa: ", decoded);
      req.user = decoded;

      next();
    } else {
      return res.status(401).json({
        EC: -1,
        DT: "",
        EM: "Not authenticated the user",
      });
    }
  } else {
    return res.status(401).json({
      EC: -1,
      DT: "",
      EM: "Not authenticated the user",
    });
  }
};

module.exports = {
  createJWT,
  verifyToken,
  checkUserJWT,
};
