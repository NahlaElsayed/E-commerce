const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const { rateLimit } = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')

dotenv.config({ path: "config.env" });

const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
const { webhookCheckout } = require("./services/orderService");
const mountRouts = require("./routes");

// Connect with db
dbConnection();

// express app
const app = express();

// enable other domain to access your application
app.use(cors());
app.options("*", cors());

// compress all response
app.use(compression());

// checkout webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Middlewares
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// make sure this comes before any routes
app.use(xss())
// To remove data using these defaults:
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message:
    "Too many accounts created from this IP, please try again after an hour",
});

// Apply the rate limiting middleware to all requests
app.use("/api", limiter);

// middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

// Mount Routes
mountRouts(app);

app.all("*", (req, res, next) => {
  // // create error and send it to error handling middleware
  // const err= new Error(`cann't find route ${req.originalUrl}`)
  // // send error handling middleware
  // next(err.message)
  next(new ApiError(`cann't find route ${req.originalUrl}`, 400));
});
// global error handling middleware

app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

// handle rejection outside express
// event=>listin=>callback(err) any error exit express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("suhtting down........");
    process.exit(1);
  });
});
