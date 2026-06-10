//importiamo la connessione del DB
const connection = require("../data/db");

// Creiamo una funzione helper che restituisce la query base
// per selezionare i prodotti con il loro eventuale sconto.
// In questo modo evitiamo di riscrivere sempre la stessa logica.
// La query restituisce:
// 1. Tutti i campi della tabella products
// 2. Percentuale di sconto (0 se non presente)
// 3. Prezzo finale calcolato in base allo sconto
function baseProductSelect() {
    return `
        SELECT 
            products.*,  -- tutti i campi del prodotto

            -- percentuale sconto, se non presente restituisce 0
            COALESCE(s.discount_percentage, 0) AS discount_percentage,

            -- prezzo finale calcolato: se c'è sconto sottrae dal prezzo originale
            CASE 
                WHEN s.discount_percentage IS NOT NULL
                THEN products.price - (products.price * s.discount_percentage / 100)
                ELSE products.price
            END AS final_price

        FROM products

        -- join opzionale con la tabella sales per ottenere sconti attivi
        LEFT JOIN sales s 
            ON products.id = s.product_id
            AND NOW() BETWEEN s.start_date AND s.end_date
    `;
}

// Funzione per ottenere tutti i prodotti dal database
// Possiamo filtrare per:
// - search → ricerca per nome prodotto
// - category → categoria del prodotto
// - region → regione del prodotto
function indexProducts(req, res) {

    // Prendiamo i parametri dalla query string
    const { search, category, region, sort } = req.query;

    // Query principale che recupera prodotti con join su categorie e regioni
    let sql = `
        SELECT 
            products.*,
            categories.name AS nomi_categorie,
            regions.name AS nomi_regioni,

            COALESCE(s.discount_percentage, 0) AS discount_percentage,
            CASE 
                WHEN s.discount_percentage IS NOT NULL
                THEN products.price - (products.price * s.discount_percentage / 100)
                ELSE products.price
            END AS final_price

        FROM products
        JOIN categories ON products.category_id = categories.id
        JOIN regions ON products.region_id = regions.id
        LEFT JOIN sales s 
            ON products.id = s.product_id
            AND NOW() BETWEEN s.start_date AND s.end_date

        WHERE 1=1  -- serve per concatenare i filtri dinamici
    `;

    // Array per parametri della query per evitare SQL injection
    const params = [];

    // Se l'utente ha passato il parametro "search", aggiungiamo un filtro LIKE
    if (search) {
        sql += ' AND products.name LIKE ?';
        params.push(`%${search}%`);
    }

    // Se l'utente ha passato il parametro "category", filtriamo per nome categoria
    if (category) {
        sql += ' AND categories.name = ?';
        params.push(category);
    }

    // Se l'utente ha passato il parametro "region", filtriamo per nome regione
    if (region) {
        sql += ' AND regions.name = ?';
        params.push(region);
    }

    // gestione ordinamento
    if (sort) {
        switch (sort) {

            case "name_asc":
                sql += " ORDER BY products.name ASC";
                break;

            case "name_desc":
                sql += " ORDER BY products.name DESC";
                break;

            case "price_asc":
                sql += " ORDER BY final_price ASC";
                break;

            case "price_desc":
                sql += " ORDER BY final_price DESC";
                break;

            default:
                break;
        }
    } else {
        sql += " ORDER BY RAND()";
    }

    connection.query(sql, params, (err, results) => {
        if (err) {
            // Se c'è un errore lato database, restituiamo errore 500
            return res.status(500).json({ error: 'Database query failed' });
        }

        // Per ogni prodotto aggiungiamo:
        // 1. Percorso completo immagine
        // 2. Flag is_on_sale → true se il prodotto è in sconto
        const products = results.map(product => ({
            // manteniamo tutti i campi originali
            ...product,
            // aggiungiamo percorso completo immagine
            image: req.imagePath + product.image,
            // true se c'è sconto
            is_on_sale: product.discount_percentage > 0
        }));

        // Restituiamo JSON con il totale prodotti e array dei prodotti
        res.json({
            totals: products.length,
            results: products
        });
    });
}



// Restituisce i dettagli di un prodotto tramite ID
function showProductById(req, res) {

    // Prendiamo l'id dai parametri della rotta
    const productId = req.params.id;

    // Creiamo query usando la query base e filtrando per ID
    const sql = `
        ${baseProductSelect()}
        WHERE products.id = ?
    `;

    // Eseguiamo la query
    connection.query(sql, [productId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });

        // Se il prodotto non esiste restituiamo errore 404
        if (results.length === 0) return res.status(404).json({ error: 'Product not found' });

        // Aggiungiamo percorso immagine completo
        const product = {
            ...results[0],
            image: req.imagePath + results[0].image
        };

        // Restituiamo il prodotto come JSON
        res.json(product);
    });
}

// Restituisce i dettagli di un prodotto tramite lo slug
function showProductBySlug(req, res) {

    const productSlug = req.params.slug;

    // Query base filtrata per slug
    const sql = `
        ${baseProductSelect()}
        WHERE products.slug = ?
    `;

    connection.query(sql, [productSlug], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });

        if (results.length === 0) return res.status(404).json({ error: 'Product not found' });

        const product = {
            ...results[0],
            image: req.imagePath + results[0].image
        };

        res.json(product);
    });
}


// Restituisce tutti i prodotti contrassegnati come "favorites", ordinati in modo casuale
function getFavorites(req, res) {

    const sql = `
        ${baseProductSelect()}
        WHERE products.favorites = 1
        ORDER BY RAND()
    `;

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });

        // Per ogni prodotto aggiungiamo percorso immagine completo
        const products = results.map(product => ({
            ...product,
            image: req.imagePath + product.image
        }));

        res.json(products);
    });
}


// Restituisce i prodotti della categoria oli (category_id = 23)
function getOils(req, res) {

    const sql = `
        ${baseProductSelect()}
        WHERE products.category_id = 23
        ORDER BY RAND()
    `;

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });

        const products = results.map(product => ({
            ...product,
            image: req.imagePath + product.image
        }));

        res.json(products);
    });
}


// Restituisce prodotti senza filtri in ordine casuale
function getRandomProducts(req, res) {

    const sql = `
        ${baseProductSelect()}
        ORDER BY RAND()
    `;

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });

        const products = results.map(product => ({
            ...product,
            image: req.imagePath + product.image
        }));

        res.json(products);
    });
}



// Restituisce prodotti filtrati per nome regione
function getProductsByRegionName(req, res) {

    const regionName = req.params.name;

    const sql = `
        ${baseProductSelect()}
        JOIN regions ON products.region_id = regions.id
        WHERE regions.name = ?
    `;

    connection.query(sql, [regionName], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });

        const products = results.map(product => ({
            ...product,
            image: req.imagePath + product.image
        }));

        res.json(products);
    });
}



// Restituisce fino a 4 prodotti correlati (stessa categoria o regione)
function relatedProducts(req, res) {

    const { id } = req.params;

    const sql = `
        SELECT DISTINCT 
            p2.*,

            COALESCE(s.discount_percentage, 0) AS discount_percentage,
            CASE 
                WHEN s.discount_percentage IS NOT NULL
                THEN p2.price - (p2.price * s.discount_percentage / 100)
                ELSE p2.price
            END AS final_price

        FROM products p1
        JOIN products p2
            ON (p1.category_id = p2.category_id OR p1.region_id = p2.region_id)
        LEFT JOIN sales s 
            ON p2.id = s.product_id
            AND NOW() BETWEEN s.start_date AND s.end_date
        WHERE p1.id = ?
        AND p2.id != ?
        ORDER BY RAND()
        LIMIT 4
    `;

    connection.query(sql, [id, id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Errore nel recupero dei prodotti correlati' });

        const data = results.map(p => ({
            ...p,
            image: req.imagePath + p.image
        }));

        res.json(data);
    });
}



// Restituisce tutte le regioni con percorso immagine completo
function indexRegions(req, res) {

    const sql = 'SELECT * FROM regions';

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });

        const regions = results.map(region => ({
            ...region,
            image: req.imagePath + region.image
        }));

        res.json(regions);
    });
}


// Restituisce tutte le categorie senza modifiche
function indexCategories(req, res) {

    const sql = 'SELECT * FROM categories';

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });

        res.json(results);
    });
}

// Restituisce solo prodotti scontati (discount_percentage > 0)
function getDiscountedProducts(req, res) {

    const { sort } = req.query;

    let sql = `
        ${baseProductSelect()}
        WHERE COALESCE(s.discount_percentage, 0) > 0
    `;

    // gestione ordinamento
    if (sort) {
        switch (sort) {

            case "name_asc":
                sql += " ORDER BY products.name ASC";
                break;

            case "name_desc":
                sql += " ORDER BY products.name DESC";
                break;

            case "price_asc":
                sql += " ORDER BY final_price ASC";
                break;

            case "price_desc":
                sql += " ORDER BY final_price DESC";
                break;

            default:
                sql += " ORDER BY RAND()";
                break;
        }
    } else {
        sql += " ORDER BY RAND()";
    }

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });

        const products = results.map(product => ({
            ...product,
            image: req.imagePath + product.image,
            is_on_sale: product.discount_percentage > 0
        }));

        res.json({
            totals: products.length,
            results: products
        });
    });
}

module.exports = {
    indexProducts,
    indexRegions,
    showProductById,
    showProductBySlug,
    getProductsByRegionName,
    getFavorites,
    getOils,
    getRandomProducts,
    relatedProducts,
    indexCategories,
    getDiscountedProducts
};