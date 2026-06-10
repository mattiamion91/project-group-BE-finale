//decidiamop una soglia per spedizione gratuita e costo di spedizione standard
const FREE_SHIPPING_THRESHOLD = 50;
const DEFAULT_SHIPPING_PRICE = 10;

//creaimo una funzione per calcolare il totale carrello e la spedizione
function calculateShipping(req, res) {
    const { products } = req.body;

    //verifichiamo che i prodotti siano presenti e siano un array
    if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: "Prodotti mancanti" });
    }

    //calcolo del totale carrello
    const cartTotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

    //calcolo del prezzo di spedizione: gratuito se supera la soglia
    const shippingPrice = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_PRICE;

    //risposta JSON con totale, spedizione e totale finale
    res.json({
        cartTotal,
        shippingPrice,
        totalFinal: cartTotal + shippingPrice
    });
}

module.exports = { calculateShipping };