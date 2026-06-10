//importiamo la connessione del DB
const connection = require('../data/db');

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

// funzione generica per invio email
function sendEmail(to, subject, html) {
    return transporter.sendMail({
        from: '"Ecommerce Test" <test@example.com>',
        to,
        subject,
        html
    });
}

// funzione per inviare entrambe le email (cliente + admin) con delay per l'admin
function sendOrderEmails(orderId, totalAmount, products, shippingData) {
    // invio email cliente
    sendEmail(shippingData.email, "Conferma ordine", `
        <h1>Grazie ${shippingData.name}</h1>
        <p>Ordine #${orderId}</p>
        <p>Totale: €${totalAmount}</p>
        <p>Prodotti: ${products.length}</p>
    `)
        .then(() => {
            console.log("Email cliente inviata");

            // invio email admin dopo 1 secondo
            setTimeout(() => {
                sendEmail("5f702556730e37@sandbox.mailtrap.io", "Nuovo ordine ricevuto", `
                <h1>Nuovo ordine</h1>
                <p>ID: ${orderId}</p>
                <p>Cliente: ${shippingData.email}</p>
                <p>Totale: €${totalAmount}</p>
            `)
                    .then(() => console.log("Email admin inviata"))
                    .catch(err => console.log("Errore email admin:", err));
            }, 20000);

        })
        .catch(err => console.log("Errore email cliente:", err));
}

function checkout(req, res) {

    //prendiamo dal body della richiesta i dati necessari al checkout
    const { shippingData, billingData, products, shipping_price, discount_code } = req.body;

    //creiamo una variabile per l'inserimento dati spedizione
    const shippingSql = `
        INSERT INTO shipping_datas
        (name,surname,country,email,phone,region,province,city,postal_code,street)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    `;

    //eseguiamo la query di inserimento spedizione
    connection.query(
        shippingSql,
        [
            shippingData.name,
            shippingData.surname,
            shippingData.country,
            shippingData.email,
            shippingData.phone,
            shippingData.region,
            shippingData.province,
            shippingData.city,
            shippingData.postal_code,
            shippingData.street
        ],
        (err, shippingResult) => {

            //se errore DB ritorno subito
            if (err) return res.status(500).json(err);

            //salviamo id spedizione appena creata
            const shippingId = shippingResult.insertId;

            //creiamo una varibile per l'inserimento dati fatturazione
            const billingSql = `
            INSERT INTO billing_datas
            (name,surname,country,email,phone,region,province,city,postal_code,street)
            VALUES (?,?,?,?,?,?,?,?,?,?)
        `;

            connection.query(
                billingSql,
                [
                    billingData.name,
                    billingData.surname,
                    billingData.country,
                    billingData.email,
                    billingData.phone,
                    billingData.region,
                    billingData.province,
                    billingData.city,
                    billingData.postal_code,
                    billingData.street
                ],
                (err, billingResult) => {

                    //se errore DB fatturazione
                    if (err) return res.status(500).json(err);

                    //salviamo id fatturazione
                    const billingId = billingResult.insertId;

                    //gestione sconto
                    let discountAmount = 0;
                    let discountId = null; // ora possiamo usare null se la colonna lo permette

                    //creiamo una funzione per creare l'ordine e associare i prodotti
                    const createOrder = () => {

                        const totalProducts = (products || []).reduce(
                            (sum, p) => sum + p.price * p.quantity,
                            0
                        );

                        if (discountId) {
                            discountAmount = totalProducts * (discountAmount / 100);
                        }

                        const totalAmount = totalProducts + shipping_price - discountAmount;

                        const orderSql = `
                    INSERT INTO orders
                    (shipping_data_id,billing_data_id,total_amount,order_date,shipping_price,applided_discount_code,discount_amount)
                    VALUES (?,?,?,?,?,?,?)
                `;

                        connection.query(orderSql, [
                            shippingId,
                            billingId,
                            totalAmount,
                            new Date(),
                            shipping_price,
                            discountId,
                            discountAmount
                        ], (err, orderResult) => {

                            if (err) return res.status(500).json(err);

                            const orderId = orderResult.insertId;

                            const orderProducts = products.map(p => [orderId, p.id, p.price, p.quantity]);

                            const orderProductSql = `
                        INSERT INTO order_product (order_id, product_id, price, quantity)
                        VALUES ?
                    `;

                            connection.query(orderProductSql, [orderProducts], (err) => {
                                if (err) return res.status(500).json(err);

                                const orderResponse = {
                                    id: orderId,
                                    shippingData,
                                    billingData,
                                    products,
                                    shipping_price,
                                    discount_code,
                                    discountAmount,
                                    totalAmount
                                };

                                res.json({ success: true, order: orderResponse });

                                // INVIO EMAIL IN BACKGROUND con funzione separata
                                sendOrderEmails(orderId, totalAmount, products, shippingData);
                            });

                        });
                    };

                    //se c'è codice sconto, controllo validità
                    if (discount_code) {

                        const discountSql = `
                    SELECT * FROM discount_codes
                    WHERE code = ? AND expires_at > NOW()
                `;

                        connection.query(discountSql, [discount_code], (err, result) => {

                            if (err) return res.status(500).json(err);

                            if (result.length > 0) {
                                discountId = result[0].id;
                                discountAmount = result[0].percentage;
                            }

                            createOrder();

                        });

                    } else {

                        createOrder();

                    }

                });
        });

}

module.exports = { checkout };