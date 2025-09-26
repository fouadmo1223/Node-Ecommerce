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

const validateRegister = [
  body("userName")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Invalid phone number")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 digits"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ,
  errorValidator,
];

module.exports = {
  validateRegister,
};
