// controllers/cartController.js
const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// ------------------------------------------------------
// @desc    Get User Cart
// @route   GET /api/cart
// @access  private (owner only)
// ------------------------------------------------------
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  res.status(200).json({ success: true, data: cart });
});

// ------------------------------------------------------
// @desc    Add Item to Cart
// @route   POST /api/cart
// @access  private
// ------------------------------------------------------
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = product.priceAfterDiscount || product.price;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.priceAfterDiscount || product.price,
    });
  }

  cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  await cart.save();
  res.status(200).json({ success: true, data: cart });
});

// ------------------------------------------------------
// @desc    Remove Item Completely from Cart
// @route   DELETE /api/cart/:productId
// @access  private
// ------------------------------------------------------
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  await cart.save();
  res.status(200).json({ success: true, data: cart });
});

// ------------------------------------------------------
// @desc    Decrease Quantity of a Product
// @route   PUT /api/cart/:productId/decrease
// @access  private
// ------------------------------------------------------
const decreaseQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.find((i) => i.product.toString() === productId);

  if (!item) {
    res.status(404);
    throw new Error("Product not in cart");
  }

  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    // remove product if quantity would go below 1
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  }

  cart.totalPrice = cart.items.reduce(
    (sum, i) => sum + i.quantity * i.price,
    0
  );

  await cart.save();
  res.status(200).json({ success: true, data: cart });
});

module.exports = { getCart, addToCart, removeFromCart, decreaseQuantity };
