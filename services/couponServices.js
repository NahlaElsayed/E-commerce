const fatory = require("./handlersFactory");
const Coupon = require("../models/couponModel");
// @desc    Get list of copons
// @route   GET /api/v1/copons
// @access  private(admin-manger)
exports.getCopons = fatory.getAll(Coupon);
// @desc    Get specific Coupon by id
// @route   GET /api/v1/Coupons/:id
// @access  private(admin-manger)
exports.getCoupon = fatory.getOne(Coupon);
// @desc    Create Coupon
// @route   POST  /api/v1/coupons
// @access  Private (admin-manager)
exports.createCoupon = fatory.createOne(Coupon);
// @desc    Update specific Coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private (admin-manager)
exports.updataCoupon = fatory.updataOne(Coupon);

// // @desc    Delete specific Coupon
// // @route   DELETE /api/v1/coupons/:id
// // @access  Private (admin-manager)
exports.deleteCoupon = fatory.deleteOne(Coupon)
