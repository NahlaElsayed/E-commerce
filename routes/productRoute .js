const express = require("express");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const {
  getProducts,
  getProduct,
  createProduct,
  updataProduct,
  deleteProduct,
  uploadProductImage,
  resizeProductImage,
} = require("../services/productService");
const authService = require("../services/authServices");
const reviewRoute=require("./reviewRoute")

const router = express.Router();

// post products/ productId/ reviews
// get products/ productId/ reviews
// get products/ productId/ reviews/reviewId

router.use("/:productId/reviews", reviewRoute);


router
  .route("/")
  .get(getProducts)
  .post(authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadProductImage,
    resizeProductImage,
    createProductValidator,
    createProduct
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadProductImage,
    resizeProductImage,
    updateProductValidator,
    updataProduct
  )
  .delete(authService.protect,
    authService.allowedTo("admin"),deleteProductValidator, deleteProduct);

module.exports = router;
