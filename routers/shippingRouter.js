//import express
const express = require("express");
const router = express.Router();

//import controller
const { calculateShipping } = require("../controllers/shippingController");

//rotta POST per calcolare la spedizione
router.post("/calculate-shipping", calculateShipping);

module.exports = router;