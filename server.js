const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require('cors')
const compression = require('compression')


dotenv.config({ path: "config.env" });

const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");

const mountRouts = require("./routes");

// Connect with db
dbConnection();

// express app
const app = express();
// enable other domain to access your application 
app.use(cors())
app.options('*', cors())
// compress all response
app.use(compression())
// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

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
