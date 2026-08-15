const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

router.get("/", orderController.getOrders);
router.post("/", orderController.placeOrder);
router.get("/:id", orderController.getOrderDetails);

module.exports = router;