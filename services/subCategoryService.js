const SubCategory = require("../models/subCategoryModel");
const fatory = require("./handlersFactory");

exports.setCategorytoBody = (req, res, next) => {
  // nexted route(create)
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};
// @desc    Create subcategory
// @route   POST  /api/v1/Subcategories
// @access  Private (admin-manager)
exports.createSubCategory = fatory.createOne(SubCategory);
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};
// @desc    Get list of Subcategories
// @route   GET /api/v1/Subcategories
// @access  Public
exports.getSubCategories = fatory.getAll(SubCategory);
// ----------
// @desc    Get specific subcategory by id
// @route   GET /api/v1/Subcategories/:id
// @access  Public
exports.getSubCategory = fatory.getOne(SubCategory);

// @desc    Update specific subcategory
// @route   PUT /api/v1/categories/:id
// @access  Private (admin-manager)
exports.updataSubCategory = fatory.updataOne(SubCategory);
// ----------------
// // @desc    Delete specific subcategory
// // @route   DELETE /api/v1/categories/:id
// // @access  Private (admin-manager)

exports.deleteSubCategory = fatory.deleteOne(SubCategory);
