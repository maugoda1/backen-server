// requires
var express = require('express'); // Libreria principal para trabajar con el servidor
var mongoose = require('mongoose'); // Libreria para trabajar con mongo


// Inicializar variables
var app = express();

// conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'onLine');
})

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion correcta'
    })
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server puerto 3000: \x1b[32m%s\x1b[0m', 'onLine');
})