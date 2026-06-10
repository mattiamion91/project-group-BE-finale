const express = require('express');
const router = express.Router();
const orderController = require("../controllers/orderController")

//endpoint checkout
router.post("/checkout", orderController.checkout);

module.exports = router;