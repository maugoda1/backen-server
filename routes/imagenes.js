var express = require('express'); // Libreria principal para trabajar con el servidor

// Inicializar variables
var app = express();

// importar el file systen de node
var fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var path = `./uploads/${ tipo }/${ img }`;

    fs.exists(path, existe => {
        if (!existe) {
            path = './assets/no-img.jpg';
        }

        res.sendfile(path);

    })

});

module.exports = app;