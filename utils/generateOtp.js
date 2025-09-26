// utils/generateOtp.js
function generateOtp() {
  // Ensures the number is always 6 digits (100000–999999)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = generateOtp;
