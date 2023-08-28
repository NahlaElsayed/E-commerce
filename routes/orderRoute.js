const express = require("express");

const {
  createCashOrder,
  filterOrderForLoggedUser,
  getAllOrders,
  findSpecificOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require("../services/orderService");
const authService = require("../services/authServices");

const router = express.Router();

router.use(authService.protect);

router.get(
  "/checkout-session/:cartId",
  authService.allowedTo("user"),
  checkoutSession
);

router.route("/:cartId").post(authService.allowedTo("user"), createCashOrder);
router.get(
  "/",
  authService.allowedTo("user", "manager", "admin"),
  filterOrderForLoggedUser,
  getAllOrders
);
router.get("/:id", findSpecificOrders);
router.put(
  "/:id/pay",
  authService.allowedTo("manager", "admin"),
  updateOrderToPaid
);
router.put(
  "/:id/deliver",
  authService.allowedTo("manager", "admin"),
  updateOrderToDelivered
);
module.exports = router;
