function errorsHandler(err, req, res, next) {
    //forzo lo stato per convenzione al codice che da errore interno del server
    res.status(500)
    //aggiungo delle info per arricchire messaggio di errore
    res.json({
        error: err.message,
    });
};

module.exports = errorsHandler;