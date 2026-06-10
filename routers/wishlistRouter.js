const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

//rotta show per visualizzzare i prodotti nella wishlist
router.get("/", wishlistController.getWishlist);

//rotta store per aggiungere prodotti alla wishlist
router.post("/add", wishlistController.addToWishlist);

//rotta destroy per rimuovere prodotti dalla wishlist
router.delete("/remove/:id", wishlistController.removeFromWishlist);

//export rotte
module.exports = router;