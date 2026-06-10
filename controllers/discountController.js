//importiamo la connessione del DB
const connection = require("../data/db");

//funzione che verifica il codice sconto
function validateDiscount(req, res) {

    //estraiamo il codice inviato dal frontend
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            valid: false,
            message: "Nessun codice sconto inviato"
        });
    }

    //query SQL per cercare il codice
    const sql = `
        SELECT *
        FROM discount_codes
        WHERE code = ?
        AND expires_at > NOW()
        LIMIT 1
    `;

    //eseguiamo la query passando il codice come parametro
    connection.query(sql, [code], (err, results) => {

        //errore del database
        if (err) {
            console.error("Errore query DB:", err); // <-- utile per debug
            return res.status(500).json({
                error: "Errore database"
            });
        }

        //se non trova risultati il codice è inesistente o scaduto
        if (results.length === 0) {
            return res.status(404).json({
                valid: false,
                message: "Codice sconto non valido o scaduto"
            });
        }

        //se arriviamo qui il codice è valido
        const discount = results[0];

        //restituiamo la percentuale di sconto
        res.json({
            valid: true,
            percentage: discount.percentage
        });

    });

}

module.exports = { validateDiscount };