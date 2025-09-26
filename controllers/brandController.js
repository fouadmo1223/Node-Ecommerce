const mongoose = require("mongoose");
const Brand = require("../models/brandModel.js");
const asyncHandler = require("express-async-handler");
var slugify = require("slugify");

// ------------------------------------------------------
// @desc    Create New Brand
// @route   POST /api/brands
// @access  Private
// ------------------------------------------------------
const createBrand = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  if (!name || name.trim().length < 3 || name.trim().length > 32) {
    return res.status(400).json({
      message: "Brand name must be between 3 and 32 characters",
      success: false,
    });
  }
  if (!slug || slug.trim().length < 3 || slug.trim().length > 32) {
    return res.status(400).json({
      message: "Brand slug must be between 3 and 32 characters",
      success: false,
    });
  }

  const brandExists = await Brand.findOne({ name: name.trim() });
  if (brandExists) {
    return res
      .status(400)
      .json({ message: "Brand name already exists", success: false });
  }

  try {
    const brand = await Brand.create({
      name: name.trim(),
      slug: slugify(slug.trim(), "-"),
    });

    res.status(201).json({
      message: "Brand created successfully",
      success: true,
      data: brand,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Invalid input",
        success: false,
        errors,
      });
    }
    throw error;
  }
});

// ------------------------------------------------------
// @desc    Get All Brands (with pagination & sort)
// @route   GET /api/brands?page=&limit=&sort=asc|desc
// @access  Public
// ------------------------------------------------------
const getAllBrands = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const sortOrder = (req.query.sort || req.body?.sort || "asc").toLowerCase();
  const sort = sortOrder === "desc" ? -1 : 1;

  const skip = (page - 1) * limit;

  try {
    const brands = await Brand.find({})
      .sort({ name: sort })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Brand.countDocuments();

    res.status(200).json({
      message: "Brands fetched successfully",
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: brands,
    });
  } catch (error) {
    throw error;
  }
});

// ------------------------------------------------------
// @desc    Get Brand
// @route   GET /api/brands/:id
// @access  Public
// ------------------------------------------------------
const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID is required", success: false });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID", success: false });
  }

  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      return res
        .status(404)
        .json({ message: "Brand not found", success: false });
    }
    res.status(200).json({
      message: "Brand fetched successfully",
      success: true,
      data: brand,
    });
  } catch (error) {
    throw error;
  }
});

// ------------------------------------------------------
// @desc    Update Brand
// @route   PUT /api/brands/:id
// @access  Public
// ------------------------------------------------------
const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;

  if (!id) {
    return res.status(400).json({ message: "ID is required", success: false });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID", success: false });
  }

  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      return res
        .status(404)
        .json({ message: "Brand not found", success: false });
    }

    if (!name && !slug) {
      return res
        .status(400)
        .json({ message: "At least one field is required", success: false });
    }

    if (name && name.trim() !== "") {
      brand.name = name.trim();
    }

    if (slug && slug.trim() !== "") {
      const newSlug = slugify(slug.trim(), "-");

      const slugExists = await Brand.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });
      if (slugExists) {
        return res
          .status(400)
          .json({ message: "Slug already in use", success: false });
      }

      brand.slug = newSlug;
    }

    await brand.save();

    res.status(200).json({
      message: "Brand updated successfully",
      success: true,
      data: brand,
    });
  } catch (error) {
    throw error;
  }
});

// ------------------------------------------------------
// @desc    Delete Brand
// @route   DELETE /api/brands/:id
// @access  Public
// ------------------------------------------------------
const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID is required", success: false });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Invalid ID format", success: false });
  }

  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) {
    return res.status(404).json({ message: "Brand not found", success: false });
  }

  res.status(200).json({
    message: "Brand deleted successfully",
    success: true,
    data: brand,
  });
});

module.exports = {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  deleteBrand,
};
