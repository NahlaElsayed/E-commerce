const express = require("express");

const {
  getCopons,
  getCoupon,
  updataCoupon,
  createCoupon,
  deleteCoupon,
} = require("../services/couponServices");
const authService = require("../services/authServices");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("admin", "manager"));

router.route("/").get(getCopons).post(createCoupon);
router.route("/:id").get(getCoupon).put(updataCoupon).delete(deleteCoupon);

module.exports = router;
