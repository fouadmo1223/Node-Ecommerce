const { param, validationResult } = require("express-validator");

// Error handler middleware for validations
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

// Validation middleware for ID
const isValidID = [
  param("id").isMongoId().withMessage("Invalid ID"),
  errorValidator,
];

module.exports = { isValidID };
