const mongoose = require("mongoose");
const bycrpt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name requried"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email requried"],
      unique: [true, "email already taken"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password requried"],
      minlength: [6, "too short password"],
    },
    passwordChangeAt: Date,
    passwordRestCode: String,
    passwordRestExpired: Date,
    passwordRestVerfied: Boolean,
    phone: String,
    profileImage: String,
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    // embeded
    address: [
      {
        id: { type: mongoose.Schema.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
    // child refernce (one to many)
    wishList: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // hashing password user
  this.password = await bycrpt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
