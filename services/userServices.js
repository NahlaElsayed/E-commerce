const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const fatory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");

const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
// upload single image
exports.uploadUserImage = uploadSingleImage("profileImage");

// image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // console.log(req.file)
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);
    // save image into our db
    req.body.profileImage = filename;
  }

  next();
});

// @desc    Get list of Users
// @route   GET /api/v1/Users
// @access  Private (admin-manager)
exports.getUsers = fatory.getAll(User);

// @desc    Get specific User by id
// @route   GET /api/v1/Users/:id
// @access private (admin)
exports.getUser = fatory.getOne(User);
// @desc    Create User
// @route   POST  /api/v1/users
// @access  Private(admin)
exports.createUser = fatory.createOne(User);

// @desc    Update specific User
// @route   PUT /api/v1/users/:id
// @access  Private (admin)

exports.updataUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      role: req.body.role,
      email: req.body.email,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No Find document This Id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bycrpt.hash(req.body.password, 12),
      passwordChangeAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No Find document This Id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});
// // @desc    Delete specific User
// // @route   DELETE /api/v1/users/:id
// // @access  Private (admin)
exports.deleteUser = fatory.deleteOne(User);

// @desc    Get logged user data
// @route   GET /api/v1/Users/getMe
// @access  Private (protect)
exports.getloggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    updata logged user password
// @route   PUT /api/v1/Users/changeMyPassword
// @access  Private (protect)
exports.updataLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1)updata user password based on user payload
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bycrpt.hash(req.body.password, 12),
      passwordChangeAt: Date.now(),
    },
    {
      new: true,
    }
  );
  // 2)generated token because token old invaild
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

// @desc    updata logged user Data without(password ,role)
// @route   PUT /api/v1/Users/upataMe
// @access  Private (protect)
exports.updataLoggedUserData = asyncHandler(async (req, res, next) => {
  const upataUse = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );
  res.status(200).json({ data: upataUse });
});

// @desc    Deactivated logged user
// @route   DELETE /api/v1/Users/deleteMe
// @access  Private (protect)
exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "success" });
});


