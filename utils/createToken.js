const jwt = require("jsonwebtoken");

const Token = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
const createToken = jwt.verify(Token, process.env.JWT_SECRET_KEY);
module.exports = createToken;

