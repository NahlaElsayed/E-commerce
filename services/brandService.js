const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const fatory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const Brand = require("../models/brandModel");
// upload single image
exports.uploadBrandyImage = uploadSingleImage("image");

// image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // console.log(req.file)
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/brands/${filename}`);
  // save image into our db
  req.body.image = filename;
  next();
});

// @desc    Get list of Brands
// @route   GET /api/v1/Brands
// @access  Public
exports.getBrands = fatory.getAll(Brand);

// @desc    Get specific Brand by id
// @route   GET /api/v1/Brands/:id
// @access  Public
exports.getBrand = fatory.getOne(Brand);
// @desc    Create Brand
// @route   POST  /api/v1/categories
// @access  Private (admin-manager)
exports.createBrand = fatory.createOne(Brand);
// @desc    Update specific Brand
// @route   PUT /api/v1/categories/:id
// @access  Private (admin-manager)
exports.updataBrand = fatory.updataOne(Brand);

// // @desc    Delete specific Brand
// // @route   DELETE /api/v1/categories/:id
// // @access  Private (admin-manager)
exports.deleteBrand = fatory.deleteOne(Brand)

