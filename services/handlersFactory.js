const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
// eslint-disable-next-line no-unused-vars
const apiFeature = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`No Find document This Id ${id}`, 404));
    }
    // trigger remove event when delete specific document
    document.remove();
    res.status(204).send();
  });

exports.updataOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(
        new ApiError(`No Find document This Id ${req.params.id}`, 404)
      );
    }
    // trigger save event when updata document
    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({ data: document });
  });

exports.getOne = (Model, populationOpts) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // 1)Build query
    let query = Model.findById(id);
    if (populationOpts) {
      query = query.populate(populationOpts);
    }
    // 2)execute query
    const document = await query;
    if (!document) {
      // res.status(404).json({msg :`No Find document This Id ${id}`})
      return next(new ApiError(`No Find document This Id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // pagnation
    // Build query
    const documentCounts = await Model.countDocuments();
    // eslint-disable-next-line new-cap
    const ApiFeatures = new apiFeature(Model.find(filter), req.query)
      .paginate(documentCounts)
      .filter()
      .limitFields()
      .search(modelName)
      .sort();
    const { mongooseQuery, paginationResult } = ApiFeatures;
    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });
