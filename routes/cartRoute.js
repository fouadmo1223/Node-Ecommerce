// routes/cartRoutes.js
const express = require("express");
const { checkTokenAndAttachUser } = require("../middlewares/verfiy");
const {
  getCart,
  addToCart,
  removeFromCart,
  decreaseQuantity,
} = require("../controllers/cartController");
const router = express.Router();

router
  .route("/")
  .get(checkTokenAndAttachUser, getCart)
  .post(checkTokenAndAttachUser, addToCart);

router.route("/:productId").delete(checkTokenAndAttachUser, removeFromCart);

router
  .route("/:productId/decrease")
  .put(checkTokenAndAttachUser, decreaseQuantity);

module.exports = router;
