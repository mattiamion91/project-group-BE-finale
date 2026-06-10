const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

//rotta di index per regioni
router.get('/', productController.indexRegions);

// rotta prodotti per nome regione
router.get('/name/:name/products', productController.getProductsByRegionName);

module.exports = router;