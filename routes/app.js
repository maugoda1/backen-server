var express = require('express'); // Libreria principal para trabajar con el servidor

// Inicializar variables
var app = express();

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion correcta'
    })
});

module.exports = app;