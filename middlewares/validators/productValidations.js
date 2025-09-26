const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// 🔹 Common error handler
const errorValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }
  next();
};

// ------------------------------------------------------
// 🔹 Create Product: required + validation rules
// ------------------------------------------------------
const validateCreateProduct = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 200 })
    .withMessage("Description must be between 10 and 200 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0, max: 2000000 })
    .withMessage("Price must be between 0 and 2,000,000"),

  body("sale")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Sale must be between 0 and 100"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be 0 or higher"),

  body("imageCover").trim().notEmpty().withMessage("Image cover is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid category ID"),

  body("brand")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid brand ID"),

  body("subCategory")
    .optional()
    .isArray()
    .withMessage("SubCategory must be an array")
    .custom((arr) => arr.every((id) => mongoose.Types.ObjectId.isValid(id)))
    .withMessage("Invalid subCategory ID(s)"),

  errorValidator,
];

// ------------------------------------------------------
// 🔹 Update Product: all optional but validated
// ------------------------------------------------------
const validateUpdateProduct = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage("Description must be between 10 and 200 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0, max: 2000000 })
    .withMessage("Price must be between 0 and 2,000,000"),

  body("sale")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Sale must be between 0 and 100"),

  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be 0 or higher"),

  body("imageCover")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Image cover cannot be empty"),

  body("category")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid category ID"),

  body("brand")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid brand ID"),

  body("subCategory")
    .optional()
    .isArray()
    .withMessage("SubCategory must be an array")
    .custom((arr) => arr.every((id) => mongoose.Types.ObjectId.isValid(id)))
    .withMessage("Invalid subCategory ID(s)"),

  errorValidator,
];

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
};
