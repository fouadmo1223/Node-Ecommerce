const mongoose = require("mongoose");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel");

// ------------------------------------------------------
// @desc    Create New Product
// @route   POST /api/products
// @access  Private
// ------------------------------------------------------
const createProduct = asyncHandler(async (req, res) => {
  let {
    title,
    description,
    quantity,
    price,
    sale,
    priceAfterDiscount,
    colors,
    images,
    imageCover,
    category,
    brand,
    subCategory,
  } = req.body;

  if (!title || title.trim().length < 3 || title.trim().length > 100) {
    return res.status(400).json({
      message: "Title must be between 3 and 100 characters",
      success: false,
    });
  }

  if (!description || description.trim().length < 10) {
    return res.status(400).json({
      message: "Description must be at least 10 characters",
      success: false,
    });
  }

  if (!quantity || quantity < 0) {
    return res.status(400).json({
      message: "Quantity must be 0 or higher",
      success: false,
    });
  }

  if (!price || price < 0) {
    return res.status(400).json({
      message: "Price must be 0 or higher",
      success: false,
    });
  }

  if (!imageCover) {
    return res.status(400).json({
      message: "Image cover is required",
      success: false,
    });
  }

  if (!category || !mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({
      message: "Valid category is required",
      success: false,
    });
  }

  // 🔹 Auto-calc price after discount
  if (sale && sale > 0) {
    priceAfterDiscount = price - (price * sale) / 100;
  } else {
    priceAfterDiscount = price;
  }

  // 🔹 Auto-generate slug
  if (
    subCategory &&
    !subCategory.every((id) => mongoose.Types.ObjectId.isValid(id))
  ) {
    return res.status(400).json({
      message: "Valid subCategory array is required",
      success: false,
    });
  }
  // check if category exists
  const foundedCategory = await Category.findById(req.body.category);
  if (!foundedCategory) {
    return res
      .status(404)
      .json({ message: "Category not found", success: false });
  }

  // check if all subCategories exists
if(subCategory){
    const foundedSubCategories = await SubCategory.find({
      _id: { $in: subCategory },
    });
    if (!foundedSubCategories.length) {
      return res
        .status(404)
        .json({ message: "Sub Category not found", success: false });
    } // check if all provided subCategory IDs exist in DB
    if (foundedSubCategories.length !== subCategory.length) {
      return res.status(404).json({
        message: "One or more Sub Categories not found",
        success: false,
      });
    }
}

  const product = await Product.create({
    title: title.trim(),
    description: description.trim(),
    slug: slugify(title, "-"),
    quantity,
    price,
    sale: sale || 0,
    priceAfterDiscount: priceAfterDiscount || price,
    colors,
    images,
    imageCover,
    category,
    brand,
    subCategory,
  });

  res.status(201).json({
    message: "Product created successfully",
    success: true,
    data: product,
  });
});

// ------------------------------------------------------
// @desc    Get All Products (Advanced Filtering + Pagination + Sort)
// @route   GET /api/products
// @access  Public
// ------------------------------------------------------
const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // 1️⃣ Basic filter
  let filter = { ...req.query };
  const excludedFields = ["page", "limit", "sort", "fields", "keyword"];
  excludedFields.forEach((el) => delete filter[el]);

  // 2️⃣ Advanced filter for gte, lte, gt, lt
  let queryStr = JSON.stringify(filter);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  filter = JSON.parse(queryStr);

  // 3️⃣ Keyword search (title + description)
  if (req.query.keyword) {
    filter.$or = [
      { title: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
  }

  // 4️⃣ Query building
  let query = Product.find(filter)
    .populate("category", "name slug ")
    .populate("brand", "name slug ")
    .populate("subCategory", "name slug");

  // 5️⃣ Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy); // e.g. ?sort=price,-rating
  } else {
    query = query.sort("-createdAt"); // default: latest
  }

  // 6️⃣ Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields); // e.g. ?fields=title,price,imageCover
  } else {
    query = query.select("-__v");
  }

  // 7️⃣ Pagination
  query = query.skip(skip).limit(limit);

  // Execute
  const products = await query;
  const total = await Product.countDocuments(filter);

  res.status(200).json({
    message: "Products fetched successfully",
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: products,
  });
});

// ------------------------------------------------------
// @desc    Get Single Product
// @route   GET /api/products/:id
// @access  Public
// ------------------------------------------------------
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Invalid Product ID", success: false });
  }

  const product = await Product.findById(id)
    .populate("category")
    .populate("brand")
    .populate("subCategory");

  if (!product) {
    return res
      .status(404)
      .json({ message: "Product not found", success: false });
  }

  res.status(200).json({
    message: "Product fetched successfully",
    success: true,
    data: product,
  });
});

// ------------------------------------------------------
// @desc    Update Product
// @route   PUT /api/products/:id
// @access  Private
// ------------------------------------------------------
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Invalid Product ID", success: false });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res
      .status(404)
      .json({ message: "Product not found", success: false });
  }

  const updates = req.body;
  if (updates.title) {
    updates.slug = slugify(updates.title, "-");
  }
  if (updates.sale && updates.price) {
    updates.priceAfterDiscount =
      updates.price - (updates.price * updates.sale) / 100;
  }

  Object.assign(product, updates);
  await product.save();

  res.status(200).json({
    message: "Product updated successfully",
    success: true,
    data: product,
  });
});

// ------------------------------------------------------
// @desc    Delete Product
// @route   DELETE /api/products/:id
// @access  Private
// ------------------------------------------------------
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Invalid Product ID", success: false });
  }

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return res
      .status(404)
      .json({ message: "Product not found", success: false });
  }

  res.status(200).json({
    message: "Product deleted successfully",
    success: true,
    data: product,
  });
});

// @desc    Rate a product (add or update review)
// @route   POST /api/products/:id/rate
// @access  Private
const rateProduct = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    // validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // check if user already reviewed
    const existingReview = product.reviews.find(
      (rev) => rev.user.toString() === req.user.id.toString()
    );

    if (existingReview) {
      // update review
      existingReview.rating = rating;
      existingReview.comment = comment || existingReview.comment;
    } else {
      // add review
      product.reviews.push({
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      });
      product.numOfReviews = product.reviews.length;
    }

    // recalc average rating
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product rated successfully",
      product,
    });
  } catch (error) {
    console.error("Rate product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete a rating from a product
// @route   DELETE /api/products/:id/rate
// @access  Private
const deleteRating = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user's rating
    const ratingIndex = product.ratings.findIndex(
      (r) => r.user.toString() === req.user.id
    );

    if (ratingIndex === -1) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Remove rating
    product.ratings.splice(ratingIndex, 1);

    // Recalculate average
    product.averageRating =
      product.ratings.length > 0
        ? product.ratings.reduce((acc, r) => acc + r.rating, 0) /
          product.ratings.length
        : 0;

    await product.save();

    res.json({
      message: "Rating deleted successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update rating for a product
// @route   PUT /api/products/:id/rate
// @access  Private
const updateRating = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find if user already rated
    const existingRating = product.ratings.find(
      (r) => r.user.toString() === req.user.id
    );

    if (!existingRating) {
      return res.status(404).json({ message: "No rating found to update" });
    }

    // Update rating & comment
    existingRating.rating = rating;
    if (comment !== undefined) existingRating.comment = comment;

    // Recalculate average
    product.averageRating =
      product.ratings.reduce((acc, r) => acc + r.rating, 0) /
      product.ratings.length;

    await product.save();

    res.json({
      message: "Rating updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  rateProduct,
  deleteRating,
  updateRating,
};
