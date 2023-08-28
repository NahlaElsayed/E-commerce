const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
// const ApiError = require("../utils/apiError");

// @desc   add address to users address List
// @route   post /api/v1/address
// @access  protected/ user
exports.AddAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // $addToSet=> add address object to  user address array if address not exist
      $addToSet: { address: req.body },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "address add sucessfully. ",
    data: user.address,
  });
});

// @desc   remove address from  users address List
// @route   delete /api/v1/address/:addressId
// @access  protected/ user

exports.RomveAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // $pull=> add address object to  user address array if address exist
      $pull: { address:{_id: req.params.addressId} }
    },
    {
      new: true,
    }
);
  res.status(200).json({
    status: "success",
    message: "address remove sucessfully. ",
    data: user.address,
  });
});

// @desc   get logged address user
// @route   get /api/v1/address
// @access  protected/ user
exports.getLoggedUserAddress= asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("address");
  res.status(200).json({
    status: "success",
    result: user.address.length,
    data: user.address ,
  });
});
