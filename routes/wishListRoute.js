const express = require("express");
const authService = require("../services/authServices");

const {
  AddProductToWishList,
  RomveProductFromeWishList,
  getLoggedUserWishList,
} = require("../services/wishListServices ");

const router = express.Router();
router.use(authService.protect, authService.allowedTo("user"));

router.route("/").post(AddProductToWishList).get(getLoggedUserWishList);
router.delete("/:productId", RomveProductFromeWishList);
module.exports = router;
