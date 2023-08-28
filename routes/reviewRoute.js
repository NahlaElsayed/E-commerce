const express = require("express");
const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewValidator ");

const {
  getReviews,
  getReview,
  createReview,
  updataReview,
  deleteReview,
  createFilterObject,
  setProductIdAndUserIdToBody,
} = require("../services/revieweService ");

const router = express.Router({ mergeParams: true });
const authService = require("../services/authServices");

router
  .route("/")
  .get(createFilterObject, getReviews)
  .post(
    authService.protect,
    authService.allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );
router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(
    authService.protect,
    authService.allowedTo("user"),
    updateReviewValidator,
    updataReview
  )
  .delete(
    authService.protect,
    authService.allowedTo("user", "manager", "admin"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
