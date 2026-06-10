//importiamo la connessione del DB
const connection = require("../data/db");


//funzione per aggiungere un prodotto alla wishlist
function addToWishlist(req, res) {
    //estraiamo product_id dal body
    const { product_id } = req.body;

    if (!product_id) {
        //se non viene passato product_id, restituiamo errore 400
        return res.status(400).json({ error: "product_id mancante" });
    }

    //creiamo la query per inserire il prodotto nella tabella wishlist
    const sql = `
        INSERT INTO wishlists (product_id)
        VALUES (?)
    `;

    connection.query(sql, [product_id], (err, result) => {
        if (err) {
            //in caso di errore lato database restituiamo 500
            return res.status(500).json({ error: err });
        }

        //se tutto va bene, restituiamo messaggio di conferma
        res.json({ message: "Prodotto aggiunto alla wishlist" });
    });
}


//funzione per ottenere tutti i prodotti nella wishlist
function getWishlist(req, res) {

    //creiamo una query per ottenere i prodotti presenti nella wishlist
    const sql = `
        SELECT p.*
        FROM wishlists w
        JOIN products p
        ON w.product_id = p.id
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            //in caso di errore restituiamo 500 con il messaggio di errore
            return res.status(500).json({ error: err });
        }

        //se tutto va bene, restituiamo l'array di prodotti
        res.json(results);
    });
}

//funzione per rimuovere un prodotto dalla wishlist
function removeFromWishlist(req, res) {

    //estraiamo l'id dai parametri
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "ID prodotto mancante" });
    }

    //creiamo una query per rimuovere il prodotto dalla wishlist
    const sql = `DELETE FROM wishlists WHERE product_id = ?`;

    connection.query(sql, [id], (err) => {
        if (err) {
            //in caso di errore restituiamo 500 con il messaggio di errore
            return res.status(500).json({ error: err });
        }

        //se tutto va bene, restituiamo messaggio di conferma
        res.json({ message: "Prodotto rimosso dalla wishlist" });
    });
}

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
};