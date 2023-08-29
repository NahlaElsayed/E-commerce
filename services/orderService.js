const stripe = require("stripe")(process.env.STRIPE_SECERT);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const fatory = require("./handlersFactory");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

// @desc    create cash order
// @route   post /api/v1/orders/cartId
// @access  protected (user)
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app setting(add by admin )
  const taxPrice = 0;
  const shippingPrice = 0;
  //1) get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`there is no such cart with thid id ${req.params.cartId}`),
      404
    );
  }
  // 2)get order price depend on cart price 'check if coupon applyed'
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const TotalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3)create order with default payment
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    TotalOrderPrice,
  });
  // 4)after creating order ,decrement product quantity,increment product sold
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOptions, {});
    // 5)clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({ status: "success", data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});

// @desc    get all orders
// @route   get /api/v1/orders
// @access  protected (user-admin-manager)
exports.getAllOrders = fatory.getAll(Order);

// @desc    get specific orders
// @route   get /api/v1/orders
// @access  protected (user-admin-manager)
exports.findSpecificOrders = fatory.getOne(Order);

// @desc    updata order paid status to paid
// @route   get /api/v1/orders/:id/pay
// @access  protected (admin-manager)
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `there is no such a order with this id:  ${req.params.id}`,
        404
      )
    );
  }
  // updata order to paid
  order.isPaid = true;
  order.PaidAt = Date.now();

  const updateOrder = await order.save();
  res.status(200).json({ status: "success", data: updateOrder });
});

// @desc    updata order delivered status
// @route   get /api/v1/orders/:id/deliver
// @access  protected (admin-manager)
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `there is no such a order with this id:  ${req.params.id}`,
        404
      )
    );
  }
  // updata order to deliver
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updateOrder = await order.save();
  res.status(200).json({ status: "success", data: updateOrder });
});

// @desc    get checkout session from stripe and send it a response
// @route   get /api/v1/orders/checkout-session/cartId
// @access  protected (user)
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app setting(add by admin )
  const taxPrice = 0;
  const shippingPrice = 0;
  //1) get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`there is no such cart with thid id ${req.params.cartId}`),
      404
    );
  }
  // 2)get order price depend on cart price 'check if coupon applyed'
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const TotalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3)create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      // name: req.user.name,
      // amount: TotalOrderPrice * 100,
      // currency: "egp",
      // quantity: 1,
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: TotalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });
  // 4) send session to response
  res.status(200).json({ satuts: "success", session });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.display_items[0].amount / 100;
  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 3)create order with default payment card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    TotalOrderPrice: orderPrice,
    isPaid: true,
    PaidAt: Date.now(),
    paymentMethodType: "card",
  });
  // 4)after creating order ,decrement product quantity,increment product sold
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOptions, {});
    // 5)clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};
// @desc    this webhook will run stripe payment successfuly paid
// @route   pos /webhook-checkout
// @access  protected (user)
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECERT
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createCardOrder(event.data.object);
  }
  res.satuts(200).json({ received: true });
});
