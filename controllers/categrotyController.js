const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
var slugify = require("slugify");

// Create a new category
// ------------------------------------------------------
// @desc    Create New Category
// @route   POST /api/categories
// @access  Private
// ------------------------------------------------------
const createCategory = asyncHandler(async (req, res) => {
  //   const { error, value } = createCategorySchema.validate(req.body, {
  //     abortEarly: false,
  //   });

  //   if (error) {
  //     const errors = {};
  //     error.details.forEach((err) => {
  //       errors[err.context.key] = err.message;
  //     });
  //     return res
  //       .status(400)
  //       .json({ message: "Invalid input", success: false, errors });
  //   }

  const { name, slug } = req.body;

  if (!name || name.trim().length < 3 || name.trim().length > 32) {
    return res.status(400).json({
      message: "Category name must be between 3 and 32 characters",
      success: false,
    });
  }
  if (!slug || slug.trim().length < 3 || slug.trim().length > 32) {
    return res.status(400).json({
      message: "Category slug must be between 3 and 32 characters",
      success: false,
    });
  }

  const categoryExists = await Category.findOne({ name: name.trim() });
  if (categoryExists) {
    return res
      .status(400)
      .json({ message: "Category name already exists", success: false });
  }

  try {
    const category = await Category.create({
      name: name.trim(),
      slug: slugify(slug.trim(), "-"),
    });

    res.status(201).json({
      message: "Category created successfully",
      success: true,
      data: category,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Invalid input",
        success: false,
        errors,
      });
    }

    throw error; // Let asyncHandler pass to global error middleware
  }
});

// ------------------------------------------------------
// @desc    Get All Categories (with pagination & sort)
// @route   GET /api/categories?page=&limit=&sort=asc|desc
// @access  Public
// ------------------------------------------------------
const getAllCategories = asyncHandler(async (req, res) => {
  // Get page and limit from query params, default to page 1 and 10 items per page
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Sorting: from query (or body if you want to support POST-style filtering)
  const sortOrder = (req.query.sort || req.body?.sort || "asc").toLowerCase();
  const sort = sortOrder === "desc" ? -1 : 1;

  // Calculate how many documents to skip
  const skip = (page - 1) * limit;

  try {
    // Fetch categories with pagination + sort
    const categories = await Category.find({})
      .sort({ name: sort }) // sort by category name
      .skip(skip)
      .limit(limit)
      .lean()
      .populate("SubCategory");

    // Count total docs
    const total = await Category.countDocuments();

    res.status(200).json({
      message: "Categories fetched successfully",
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: categories,
    });
  } catch (error) {
    throw error; // Let asyncHandler pass to global error middleware
  }
});

// ------------------------------------------------------
// @desc    Get Category (with pagination & sort)
// @route   GET /api/category/:id
// @access  Public
// ------------------------------------------------------

const getCategory = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "ID is Required", success: false });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID", success: false });
  }
  try {
    const category = await Category.findById(req.params.id).populate(
      "SubCategory"
    );
    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }
    res.status(200).json({
      message: "Category fetched successfully",
      success: true,
      data: category,
    });
  } catch (error) {
    throw error; // Let asyncHandler pass to global error middleware
  }
});

// ------------------------------------------------------
// @desc    Update Category
// @route   PUT /api/category/:id
// @access  Public
// ------------------------------------------------------

const updateCategory = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "ID is Required", success: false });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID", success: false });
  }
  const { name, slug } = req.body;
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }

    if (!name && !slug) {
      return res
        .status(400)
        .json({ message: "at least one field is required", success: false });
    }

    // 🔹 Update fields (only if not empty)
    if (name && name.trim() !== "") {
      category.name = name.trim();
    }

    if (slug && slug.trim() !== "") {
      const newSlug = slugify(slug.trim(), "-");

      // Check if slug already exists for another category
      const slugExists = await Category.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });
      if (slugExists) {
        return res
          .status(400)
          .json({ message: "Slug already in use", success: false });
      }

      category.slug = newSlug;
    }
    await category.save();
    res.status(200).json({
      message: "Category updated successfully",
      success: true,
      data: category,
    });
  } catch (error) {
    throw error; // Let asyncHandler pass to global error middleware
  }
});

// ------------------------------------------------------
// @desc    Delete Category
// @route   DELETE /api/category/:id
// @access  Public
// ------------------------------------------------------

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 🔹 Validate ID
  if (!id) {
    return res.status(400).json({ message: "ID is required", success: false });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Invalid ID format", success: false });
  }

  // 🔹 Delete category
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return res
      .status(404)
      .json({ message: "Category not found", success: false });
  }

  return res.status(200).json({
    message: "Category deleted successfully",
    success: true,
    data: category,
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
