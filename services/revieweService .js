const fatory = require("./handlersFactory");
const Review = require("../models/reviweModel");

// nexted route
// get products/ productId/ reviews
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  // nexted route(create)
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = fatory.getAll(Review);

// @desc    Get specific Review by id
// @route   GET /api/v1/ Reviews/:id
// @access  Public
exports.getReview = fatory.getOne(Review);
// @desc    Create Review
// @route   POST  /api/v1/reviews
// @access  Private user
exports.createReview = fatory.createOne(Review);
// @desc    Update specific  Review
// @route   PUT /api/v1/reviews/:id
// @access  Private (admin-user)
exports.updataReview = fatory.updataOne(Review);

// // @desc    Delete specific Brand
// // @route   DELETE /api/v1/reviews/:id
// // @access  Private (user-admin-manager)
exports.deleteReview = fatory.deleteOne(Review);
