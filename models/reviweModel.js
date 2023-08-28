const mongoose = require("mongoose");
const product = require("./productModel");

const ReviewShema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "min rating value is 1.0"],
      max: [5, "max rating value 5.0"],
      required: [true, "review ratings required "],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong user"],
    },
    // parent refernce (one to meny)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "review must belong product"],
    },
  },
  { timestamps: true }
);

ReviewShema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name " });
  next();
});

ReviewShema.statics.calcAveragingAndQuntatity = async function (productId) {
  const result = await this.aggregate([
    // satge 1: get all review in specific product
    { $match: { product: productId } },
    // satag 2: grouping reviews based on product id and calclutaing  ratings Average,ratings Quantity
    {
      $group: {
        _id: "product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  // console.log(result);
  if (result.length > 0) {
    await product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

ReviewShema.post("save", async function () {
  await this.constructor.calcAveragingAndQuntatity(this.product);
});

ReviewShema.post("remove", async function () {
  await this.constructor.calcAveragingAndQuntatity(this.product);
});

module.exports = mongoose.model("Review", ReviewShema);
