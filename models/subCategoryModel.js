const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "subCategory must be unique"],
      minlength: [2, "To Short SubCategory name"],
      maxlength: [32, "To Long SubCategory name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      require: [true, "subCategory must be belong to parent Category"],
    },
  },
  { timestamps: true }
);
// Creating models from subCategorySchema (populate)
// const category = mongoose.model('category', subCategorySchema);
module.exports = mongoose.model("subCategory", subCategorySchema);
