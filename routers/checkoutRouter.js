//importiamo parte di express
const express = require('express');
//utilizziamo parte di express per gestire le rotte
const router = express.Router();
//importo relaivo controller
const checkoutRouter = require('../controllers/checkoutController')

router.post('/', checkoutRouter.createOrder);

module.exports = router