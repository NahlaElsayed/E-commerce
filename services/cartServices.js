const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupone = require("../models/couponModel");

const calcTotalPrice = (cart) => { 
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount=undefined
  return totalPrice;
};
// @desc    add product to cart
// @route   post /api/v1/cart
// @access  protected (user)
exports.AddProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);
  // get cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    // create for logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color: color,
          price: product.price,
        },
      ],
    });
  } else {
    // product exist in cart,updata product quantity
    const productIndex = await cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // if not exist ==> push product in cartItems array
      cart.cartItems.push({
        product: productId,
        color: color,
        price: product.price,
      });
    }
  }
  //   calculate total price
  calcTotalPrice(cart);

  await cart.save();
  res.status(200).json({
    status: "success",
    massage: "Product to cart successflly",
    numOfCartItem: cart.cartItems.length,
    data: cart,
  });
});
// @desc    get looged user cart
// @route   get /api/v1/cart
// @access  protected (user)
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({
    user: req.user._id,
  });
  if (!cart) {
    return next(
      new ApiError(`there no cart for this user ${req.user._id}`, 404)
    );
  }
  res.status(200).json({
    status: "success",
    numOfCartItem: cart.cartItems.length,
    data: cart,
  });
});
// @desc    remove specific cart item
// @route   delete /api/v1/cart/:itemId
// @access  protected (user)
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );
  calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItem: cart.cartItems.length,
    data: cart,
  });
});
// @desc    clear looged user cart
// @route   delete /api/v1/cart
// @access  protected (user)
exports.clearLoggedCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});
// @desc    update specigic cart item quantity
// @route   put /api/v1/cart/itemId
// @access  protected (user)
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new ApiError(`there no cart for this user ${req.user._id}`, 404)
    );
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`there no item for this id: ${req.params.itemId}`),
      404
    );
  }
  calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItem: cart.cartItems.length,
    data: cart,
  });
});
// @desc    Apply coupon in logged user cart
// @route   put /api/v1/cart/applyCoupon
// @access  protected (user)
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  //1) get coupon based on coupon name
  const coupon = await Coupone.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new ApiError(`coupon is invaild or expired`));
  }
  // 2) get logged user cart to get totalcart price
  const cart = await Cart.findOne({ user: req.user._id });
  const totalPrice = cart.totalCartPrice;
  // 3)calculate price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItem: cart.cartItems.length,
    data: cart,
  });
});
