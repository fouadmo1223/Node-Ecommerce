const { body, param, validationResult } = require("express-validator");

// Common error handler
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

// 🔹 Create SubCategory: name + slug + category required
const validateCreateSubCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Slug must be between 3 and 32 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Category must be a valid MongoDB ID"),

  errorValidator,
];

// 🔹 Update SubCategory: optional, but require at least one
const validateUpdateSubCategory = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters"),

  body("slug")
    .optional()
    .trim()
    .isLength({ min: 3, max: 32 })
    .withMessage("Slug must be between 3 and 32 characters"),

  body("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid MongoDB ID"),

  // Ensure at least one field present
  (req, res, next) => {
    if (!req.body.name || !req.body.slug || !req.body.category) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (name, slug, or category) is required for update",
      });
    }
    next();
  },

  errorValidator,
];

module.exports = {
  validateCreateSubCategory,
  validateUpdateSubCategory,
};
