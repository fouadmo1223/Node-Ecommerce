const {
  registerUser,
  loginUser,
  forgotPass,
  verifyOtp,
} = require("../controllers/authController");
const {
  validateRegister,
} = require("../middlewares/validators/authValidations");

const router = require("express").Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", loginUser);
router.post("/forgotPassword", forgotPass);
router.post("/verify-otp", verifyOtp);

module.exports = router;
