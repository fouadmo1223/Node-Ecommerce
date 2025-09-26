// controllers/orderController.js
const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const Order = require("../models/Order");


// ------------------------------------------------------
// @desc    Create Order from Cart
// @route   POST /api/orders
// @access  private
// ------------------------------------------------------
const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const order = new Order({
    user: req.user._id,
    items: cart.items,
    totalPrice: cart.totalPrice,
    paymentMethod: req.body.paymentMethod || "cash",
  });

  await order.save();
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

// ------------------------------------------------------
// @desc    Get My Orders
// @route   GET /api/orders
// @access  private
// ------------------------------------------------------
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    "items.product"
  );
  res.status(200).json({ success: true, data: orders });
});

// ------------------------------------------------------
// @desc    Delete Order (owner only)
// @route   DELETE /api/orders/:id
// @access  private
// ------------------------------------------------------
const removeOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({ _id: id, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found or not authorized");
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order removed successfully",
    data: order,
  });
});

module.exports = { createOrder, getMyOrders, removeOrder };
