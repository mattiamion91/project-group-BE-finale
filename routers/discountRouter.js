//import express
const express = require("express");
const router = express.Router();

//import controller
const { validateDiscount } = require("../controllers/discountController");

//rotta POST per validare il codice sconto
router.post("/validate", validateDiscount);

module.exports = router;