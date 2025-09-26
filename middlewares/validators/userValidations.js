const { body, validationResult } = require("express-validator");

const errorValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (process.env.NODE_ENV === "production") {
      // 🟢 Simplified errors as key-value pairs
      const formattedErrors = {};
      errors.array().forEach((err) => {
        // Only keep the first error per field
        if (!formattedErrors[err.path]) {
          formattedErrors[err.path] = err.msg;
        }
      });

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: formattedErrors,
      });
    } else {
      // 🔵 Detailed errors in development
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }
  }
  next();
};

module.exports = errorValidator;

// ------------------------------------------------------
// 🔹 Create User (all required)
// ------------------------------------------------------
const validateCreateUser = [
  body("userName")
    .trim()
    .notEmpty()
    .withMessage("UserName is required")

    // Move to next middleware
    .isLength({ min: 2, max: 20 })
    .withMessage("UserName must be between 2 and 20 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Phone must be a valid mobile number"),

  body("role")
    .optional()
    .isIn(["admin", "user", "manager"])
    .withMessage("Role must be one of: admin, user, manager"),

  errorValidator,
];

// ------------------------------------------------------
// 🔹 Update User (all optional, but at least one required)
// ------------------------------------------------------
const validateUpdateUser = [
  body("userName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("UserName must be between 2 and 20 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Must be a valid email"),

  body("password")
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Phone must be a valid mobile number"),

  body("role")
    .optional()
    .isIn(["admin", "user", "manager"])
    .withMessage("Role must be one of: admin, user, manager"),

  body("isBlocked")
    .optional()
    .isBoolean()
    .withMessage("isBlocked must be true or false"),

  // Custom validator: at least one field required
  (req, res, next) => {
    if (
      !req.body.userName &&
      !req.body.email &&
      !req.body.password &&
      !req.body.phone &&
      !req.body.role &&
      req.body.isBlocked === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (userName, email, password, phone, role, isBlocked) is required for update",
      });
    }
    next();
  },

  errorValidator,
];

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};
