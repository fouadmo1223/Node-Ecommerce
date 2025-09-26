const mongoose = require("mongoose");
const subCategory = require("../models/subCategoryModel");
const asyncHandler = require("express-async-handler");
var slugify = require("slugify");

// Create a new category
// ------------------------------------------------------
// @desc    Create Newc Sub Category
// @route   POST /api/subcategories
// @access  Private
// ------------------------------------------------------
const createSubCategory = asyncHandler(async (req, res) => {
  //

  const { name, slug, category } = req.body;
  if (!category || !mongoose.Types.ObjectId.isValid(category)) {
    return res
      .status(400)
      .json({ message: "Valid Category ID is required", success: false });
  }

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

  const SubCategoryExists = await subCategory.findOne({ name: name.trim() });
  if (SubCategoryExists) {
    return res
      .status(400)
      .json({ message: "Sub Category name already exists", success: false });
  }

  try {
    const CreatedSubCategory = await subCategory.create({
      name: name.trim(),
      slug: slugify(slug.trim(), "-"),
      category,
    });

    res.status(201).json({
      message: "Sub Category created successfully",
      success: true,
      data: CreatedSubCategory,
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
// @desc    Get All Sub Categories (with pagination & sort)
// @route   GET /api/subcategories?page=&limit=&sort=asc|desc
// @access  Public
// ------------------------------------------------------
const getAllSubCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortOrder = (req.query.sort || req.body?.sort || "asc").toLowerCase();
  const sort = sortOrder === "desc" ? -1 : 1;

  const skip = (page - 1) * limit;

  try {
    // Fetch subcategories with pagination + sort + populate parent category
    const subCategories = await subCategory
      .find({})
      .sort({ name: sort }) // sort by subcategory name
      .skip(skip)
      .limit(limit)
      .populate("category", "name slug ") // only return name & slug from parent category
      .lean();

    const total = await subCategory.countDocuments();

    res.status(200).json({
      message: "Sub Categories fetched successfully",
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: subCategories,
    });
  } catch (error) {
    throw error;
  }
});

// ------------------------------------------------------
// @desc    Get Sub Category
// @route   GET /api/subcategories/:id
// @access  Public
// ------------------------------------------------------

const getSubCategory = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "ID is Required", success: false });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID", success: false });
  }
  try {
    const foundSubcategory = await subCategory
      .findById(req.params.id)
      .populate("category")
      .lean();
    if (!foundSubcategory) {
      return res
        .status(404)
        .json({ message: "Sub Category not found", success: false });
    }
    res.status(200).json({
      message: "Sub Category fetched successfully",
      success: true,
      data: foundSubcategory,
    });
  } catch (error) {
    throw error; // Let asyncHandler pass to global error middleware
  }
});

// ------------------------------------------------------
// @desc    Update Sub Category
// @route   PUT /api/subcategory/:id
// @access  Public
// ------------------------------------------------------

const updateSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "ID is required", success: false });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID", success: false });
  }

  const { name, slug } = req.body;

  try {
    const subCat = await subCategory.findById(id);
    if (!subCat) {
      return res
        .status(404)
        .json({ message: "Sub Category not found", success: false });
    }

    if (!name && !slug) {
      return res
        .status(400)
        .json({ message: "At least one field is required", success: false });
    }

    // 🔹 Update fields only if provided
    if (name && name.trim() !== "") {
      subCat.name = name.trim();
    }

    if (slug && slug.trim() !== "") {
      const newSlug = slugify(slug.trim(), "-");

      // Check if slug already exists for another subcategory
      const slugExists = await subCategory.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });
      if (slugExists) {
        return res
          .status(400)
          .json({ message: "Slug already in use", success: false });
      }

      subCat.slug = newSlug;
    }

    await subCat.save();

    res.status(200).json({
      message: "Sub Category updated successfully",
      success: true,
      data: subCat,
    });
  } catch (error) {
    throw error;
  }
});

// ------------------------------------------------------
// @desc    Delete Sub Category
// @route   DELETE /api/subcategory/:id
// @access  Public
// ------------------------------------------------------

const deleteSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID is required", success: false });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Invalid ID format", success: false });
  }

  const subCat = await subCategory.findByIdAndDelete(id);
  if (!subCat) {
    return res
      .status(404)
      .json({ message: "Sub Category not found", success: false });
  }

  res.status(200).json({
    message: "Sub Category deleted successfully",
    success: true,
    data: subCat,
  });
});

module.exports = {
  createSubCategory,
  getAllSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
