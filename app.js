const express = require('express');
const app = express();
const port = process.env.PORT;

//import del router dei prodotti
const productRouter = require('./routers/productRouter');
//import del router delle regioni
const regionRouter = require('./routers/regionRouter');
//import router checkout
const checkoutRouter = require('./routers/checkoutRouter');
//import order router
const orderRouter = require('./routers/orderRouter');
//import rotte discount
const discountRoutes = require("./routers/discountRouter");
//import rotta di shipping
const shippingRouter = require("./routers/shippingRouter");
//import rotta wishlist
const wishlistRoutes = require('./routers/wishlistRouter');

//import del middelware di gestione di rotta inesistente
const notFound = require("./middlewares/notFound");
//import del middelware di gestione errore interno 500
const errorsHandler = require("./middlewares/errorsHandler");
//import middelware di gestione path img
const imagePath = require('./middlewares/imagePath');

//import middelware CORS
const cors = require("cors");

app.use(express.json());
//attivazione CORS
app.use(cors({
    origin: "http://localhost:5173"
}));

//attivazione della cartella public per uso file statici
app.use(express.static('public'));

//rotta home APP
app.get('/api', (req, res) => {
    res.send("<h1>Questa sarà la HomePage della pagina</h1>")
})

//rotte relative al router dei prodotti
app.use('/api/products', imagePath('product-images'), productRouter);

//rotte relative al router delle regioni
app.use('/api/regions', imagePath('regions-images'), regionRouter);

//rotta relativa al checkout
app.use('/api/checkout', checkoutRouter);

//rotta relativa al checkout orders
app.use("/api/orders", orderRouter);

//utilizzo rotte di discount
app.use("/api/discounts", discountRoutes);

//utilizzo rotte per lo shipping
app.use("/api/orders", shippingRouter);

//utilizzo rotte per wishlist
app.use('/wishlist', wishlistRoutes);

//registriamo middelware di gestione err 500
app.use(errorsHandler);

//registriamo middelware di gestione rotta inesistente
app.use(notFound);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})