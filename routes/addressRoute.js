const express = require("express");
const authService = require("../services/authServices");

const {
  AddAddress,
  RomveAddress,
  getLoggedUserAddress,
} = require("../services/addressServices");

const router = express.Router();
router.use(authService.protect, authService.allowedTo("user"));

router.route("/").post(AddAddress).get(getLoggedUserAddress);
router.delete("/:addressId", RomveAddress);
module.exports = router;
