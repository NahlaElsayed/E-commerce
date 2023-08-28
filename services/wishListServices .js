const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
// const ApiError = require("../utils/apiError");

// @desc   add product to wishList
// @route   post /api/v1/wishList
// @access  protected/ user
exports.AddProductToWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // $addToSet=> add product to wishList array if product not exist
      $addToSet: { wishList: req.body.productId },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "product add sucessfully to your wishlist. ",
    data: user.wishList,
  });
});

// @desc   remove product from wishList
// @route   delete /api/v1/wishList/:productId
// @access  protected/ user

exports.RomveProductFromeWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // $pull=> remove product from wishList array if product  exist
      $pull: { wishList: req.params.productId },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "product remove sucessfully from your wishlist. ",
    data: user.wishList,
  });
});

// @desc   get logged wishList user
// @route   get /api/v1/wishList
// @access  protected/ user
exports.getLoggedUserWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishList");
  res.status(200).json({
    status: "success",
    result: user.wishList.length,
    data: user.wishList,
  });
});
