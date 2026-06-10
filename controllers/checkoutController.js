//mi connetto al db
const connection = require("../data/db");

const nodemailer = require("nodemailer");

// configuriamo il trasportatore per Mailtrap
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "5f702556730e37",
        pass: "49f04e642dcfe0"
    }
});

//funzione per creare un ordine e procedere al checkout
function createOrder(req, res) {
    //recupero le info dal body della req e destrutturo
    const { name, surname, email, phone, street, city, province, postal_code, region, country } = req.body
    //preparo la query parametrizata per inserire i dati nella tabella shipping_data
    const shippingSql = "INSERT INTO shipping_datas (name, surname, email, phone, street, city, province, postal_code, region, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    //eseguo la query
    connection.query(shippingSql, [name, surname, email, phone, street, city, province, postal_code, region, country], (err, results) => { //callback per la gestione errore 500
        if (err)
            return res.status(500).json({ error: "non ho salvato i dati relativi alla spedizone" }) //return blocca lettura codice perche trova errore
        /* res.status(201).json({ message: "dati spedizione salvati", id: results.insertId }); */

        //recupero id dei shipping_datas appena creati
        const shippingId = results.insertId;
        const billingId = shippingId
        //uso valori dichiarati in variabili per testare la query
        const totalAmount = 50;
        const shippingPrice = 10;
        const applidedDiscountCode = "prova"
        const discountAmount = 0;
        //preparo la seconda query parametrizzata per la creazione dell ordine
        const orderSql = "INSERT INTO orders (shipping_data_id, billing_data_id, total_amount, shipping_price, applided_discount_code, discount_amount) VALUES (?, ?, ?, ?, ?, ?)";
        //eseguo la query 
        connection.query(orderSql, [shippingId, billingId, totalAmount, shippingPrice, applidedDiscountCode, discountAmount], (errOrder, resOrder) => {
            if (errOrder) {
                //checke errore su vsc
                console.log("errore tabella order", errOrder.message);
                return res.status(500).json({ error: " errore creazione ordine" });
            }

            res.status(201).json({
                message: "shipping_datas e orders creati corrrettamente",
                orderId: resOrder.insertId,
                shippinId_dellOrdine_creato: shippingId
            })
        })
    });

};
module.exports = { createOrder }