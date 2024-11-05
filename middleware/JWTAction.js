require("dotenv").config();
const jwt = require("jsonwebtoken");

const createJWT = (payload) => {
  const key = process.env.JWT_SECRET;

  let token = null;
  try {
    token = jwt.sign(payload, key, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (err) {
    console.log(err);
  }
  return token;
};

module.exports = {
  createJWT,
};
