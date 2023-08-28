const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
require("express");
const fatory = require("./handlersFactory");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const Product = require("../models/productModel");

exports.uploadProductImage = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeProductImage = asyncHandler(async (req, res, next) => {
  //   console.log(req.files);
  //1- image processing
  if (req.files.imageCover) {
    const imageCoverFilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${imageCoverFilename}`);
    // save image into our db
    req.body.imageCover = imageCoverFilename;
  }
  //   2-image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${imageName}`);
        // save image into our db
        req.body.images.push(imageName);
      })
    );
    next();
  }
});

// @desc    Get list of product
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = fatory.getAll(Product, "Products");

// ----------
// @desc    Get specific Product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = fatory.getOne(Product, "reviews");
// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private (admin-manager)
exports.createProduct = fatory.createOne(Product);
// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private (admin-manager)
exports.updataProduct = fatory.updataOne(Product);
// ----------------
// // @desc    Delete specific product
// // @route   DELETE /api/v1/products/:id
// // @access  Private (admin-manager)
exports.deleteProduct = fatory.deleteOne(Product);
