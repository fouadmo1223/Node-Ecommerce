// routes/orderRoutes.js
const express = require("express");
const { checkTokenAndAttachUser } = require("../middlewares/verfiy");
const { createOrder, removeOrder, getMyOrders } = require("../controllers/orderContoller");
const router = express.Router();


router.route("/").post(checkTokenAndAttachUser, createOrder).get(checkTokenAndAttachUser, getMyOrders);

router.route("/:id").delete(checkTokenAndAttachUser, removeOrder);

module.exports = router;
