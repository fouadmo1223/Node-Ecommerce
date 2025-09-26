const jwt = require("jsonwebtoken");

// ------------------------------------------------------
// Helper: Generate JWT
// ------------------------------------------------------
const generateToken = (id, role, email, userName) => {
  return jwt.sign({ id, role, email, userName }, process.env.JWT_SECRET, {
    expiresIn: "30d", // token expiry
  });
};
module.exports = generateToken;
