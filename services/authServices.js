const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const {sanitizeUser}=require("../utils/snatizeData")

const createToken = (payload) =>
jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
  expiresIn: process.env.JWT_EXPIRE_TIME,
});

// @desc    singup
// @route   PUT /api/v1/auth/singup
// @access  public
exports.singUp = asyncHandler(async (req, res, next) => {
  // 1)create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // 2)genrate token
  const token = createToken(user._id);
  res.status(201).json({ data: sanitizeUser(user), token });
});

// @desc    login
// @route   PUT /api/v1/auth/login
// @access  public
exports.login = asyncHandler(async (req, res, next) => {
  // 1)check if password and email in the body (vaildation layer)
  // 2)check if user & check password is correct
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bycrpt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect Email Or Password", 401));
  }
  // 3)genrate token
  const token = createToken(user._id);
  // 4) send responed to client side
  res.status(200).json({ data: user, token });
});

// @desc make sure the user is Authrazation longged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) check token is exist,if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError("you are not login, please login to access this route ", 401)
    );
  }
  //2) verify token (no change happen,expried token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) check if user exist
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError("the user that belong token does no longer exist ", 401)
    );
  }
  // 4)check if user change his passsword after token created
  if (currentUser.passwordChangeAt) {
    const passwordChangeTimeStamp = parseInt(
      currentUser.passwordChangeAt.getTime() / 1000,
      10
    );
    // change password after token created
    if (passwordChangeTimeStamp > decoded.iat) {
      return next(
        new ApiError(
          "User rectently change his password,please login again...  ",
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});
// @desc      Authorization (user permissions)
// ["admin","manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1)access roles
    // 1)access regiester user{req.user.role}
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you are not allowed to access this route", 403)
      );
    }
    next();
  });

// @desc    forget password
// @route   Post /api/v1/auth/forgetpassword
// @access  public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // 1)get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there no user with this email ${req.body.email}`, 404)
    );
  }
  // 2) if user exist ,generate hash rest random 6 digits and save in db
  const restCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedRestCode = crypto
    .createHash("sha256")
    .update(restCode)
    .digest("hex");
  // save hash password  rest code in db
  user.passwordRestCode = hashedRestCode;
  // add expiratin time for password rest code (10 min)
  user.passwordRestExpired = Date.now() + 10 * 60 * 1000;
  user.passwordRestVerfied = false;
  await user.save();
  // 3) send the rest code via email
  try {
    await sendEmail({
      email: user.email,
      subject: "your password rest code (vaild 10 min )",
      message: `Hi ${user.name} \n we received a requset rest the password on your E-shop account\n ${restCode}\n enter this code to complete the rest.`,
    });
  } catch (err) {
    user.passwordRestCode = undefined;
    user.passwordRestExpired = undefined;
    user.passwordRestVerfied = undefined;
    await user.save();
    return next(new ApiError("there is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "success", massage: "rest code send to email" });
});
// @desc    verfiy reset code
// @route   Post /api/v1/auth/verfiyResetCode
// @access  public
exports.verifyPasswordRestCode = asyncHandler(async (req, res, next) => {
  // 1)get user based on rest code
  const hashedRestCode = crypto
    .createHash("sha256")
    .update(req.body.restCode)
    .digest("hex");
  const user = await User.findOne({
    passwordRestCode: hashedRestCode,
    passwordRestExpired: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invaild or expired"));
  }
  // 2)reset code vaild
  user.passwordRestVerfied = true;
  await user.save();
  res.status(200).json({ status: "success" });
});

// @desc    rest password
// @route   Post /api/v1/auth/resetPassword
// @access  public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1)get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user this email ${req.body.email}`, 404)
    );
  }
  // 2)check if reset code verfied
  if (!user.passwordRestVerfied) {
    return next(new ApiError("rest code not verfied", 400));
  }
  user.password = req.body.newPassword;
  user.passwordRestCode = undefined;
  user.passwordRestExpired = undefined;
  user.passwordRestVerfied = undefined;
  await user.save();

  // 3)if everything is ok ,generated token
  const token = createToken(user._id);
  res.status(200).json({ token });
});
