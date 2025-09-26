const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true, // store user’s name for quick display
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minLength: [3, "Title must be at least 3 characters"],
      maxLength: [100, "Title is too large"],
      required: [true, "Title  is required"],
      trim: true,
    },
    description: {
      type: String,
      minLength: [10, "description must be at least 10 characters"],
      maxLength: [200, "description is too large"],
      required: [true, "description name is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      default: "",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity can't be negative"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price can't be negative"],
      trim: true,
      max: [2000000, "Price is too large"],
    },
    sale: {
      type: Number,
      min: [0, "Sale can't be negative"],
      trim: true,
      max: [100, "Sale can't be over 100"],
      default: 0,
    },
    priceAfterDiscount: {
      type: Number,

      min: [0, "Price can't be negative"],
      trim: true,
      max: [2000000, "Price is too large"],
    },
    colors: [String],
    images: [String],
    imageCover: {
      type: String,
      required: [true, "You Must Enter Image Cover"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Parent category is required"],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    reviews: [reviewSchema],
    ratings: {
      type: Number,
      default: 0,
      min: [0, "Rating must be above or equal 0"],
      max: [5, "Rating must be below or equal 5"],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
