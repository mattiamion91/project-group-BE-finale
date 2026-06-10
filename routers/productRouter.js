//importiamo parte di express
const express = require('express');
//utilizziamo parte di express per gestire le rotte
const router = express.Router();

//importiamo relativo controller
const productController = require("../controllers/productController");

//rotta di index per prodotti
router.get('/', productController.indexProducts);

//  rotta preferiti
router.get('/favorites', productController.getFavorites);

// rotta per gli oli 
router.get("/oils", productController.getOils);

// rotta prodotti random
router.get('/random', productController.getRandomProducts);

//rotta index categorie
router.get('/categories', productController.indexCategories)

//rotta per ottenere solo prodotti scontati
router.get('/discounted', productController.getDiscountedProducts);

//rotta si show by slug
router.get('/slug/:slug', productController.showProductBySlug);

//rotta di show
router.get('/:id', productController.showProductById);

//rotta per ottenere i prodotti correlati
router.get("/:id/related", productController.relatedProducts);

//export rotte
module.exports = router;