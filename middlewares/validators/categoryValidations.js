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

// 🔹 Create Category: both required
const validateCreateCategory = [
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

  errorValidator,
];

// 🔹 Update Category: both optional, but require at least one
const validateUpdateCategory = [
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

  // Custom validator: ensure at least one field present
  (req, res, next) => {
    if (!req.body.name && !req.body.slug) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name or slug) is required for update",
      });
    }
    next();
  },

  errorValidator,
];

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
};
