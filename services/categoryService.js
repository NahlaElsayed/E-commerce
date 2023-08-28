const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const Category = require("../models/categoryModel");
const fatory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

// upload single image
exports.uploadCategoryImage = uploadSingleImage("image");

// image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // console.log(req.file)
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);
    // save image into our db
    req.body.image = filename;
  }
  next();
});

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = fatory.getAll(Category);
// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = fatory.getOne(Category);
// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private (admin-manager)
exports.createCategory = fatory.createOne(Category);
// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private (admin-manager)
exports.updataCategory = fatory.updataOne(Category);
// // @desc    Delete specific category
// // @route   DELETE /api/v1/categories/:id
// // @access  Private (admin-manager)
exports.deleteCategory = fatory.deleteOne(Category);
