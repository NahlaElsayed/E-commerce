const express = require("express");

const {
  AddProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearLoggedCart,
  updateCartItemQuantity,
  applyCoupon
} = require("../services/cartServices");
const authService = require("../services/authServices");

const router = express.Router();
router.use(authService.protect, authService.allowedTo("user"));
router.put('/applyCoupon',applyCoupon)
router
  .route("/")
  .post(AddProductToCart)
  .get(getLoggedUserCart)
  .delete(clearLoggedCart);
router.route("/:itemId").delete(removeSpecificCartItem).put(updateCartItemQuantity);
module.exports = router;
