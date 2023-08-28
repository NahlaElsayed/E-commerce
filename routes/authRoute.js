const express = require("express");
const {
  singupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");

const {
  singUp,
  login,
  forgetPassword,
  verifyPasswordRestCode,
  resetPassword,
} = require("../services/authServices");

const router = express.Router();

router.post("/singup", singupValidator, singUp);

router.post("/login", loginValidator, login);

router.post("/forgetPassword", forgetPassword);

router.post("/verfiyResetCode", verifyPasswordRestCode);

router.put("/verfiyResetPassword", resetPassword);

module.exports = router;
