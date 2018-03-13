var express = require('express'); // Libreria principal para trabajar con el servidor

// Inicializar variables
var app = express();

// inicializar el modelo de la BDs
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var fileUpload = require('express-fileupload');

// libreria para borrar archivo en disco
var fs = require('fs');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipo de coleccios para tipos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La coleccion no es valida',
            errors: { message: 'Las colecciones validas son ' + tiposValidos.join(', ') }
        });

    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar la imagen a subir' }
        });
    }

    // obtener el nombre de archivo
    var archivo = req.files.imagen;
    var nombreCorto = archivo.name.split('.');
    var extensionArchivo = nombreCorto[nombreCorto.length - 1];

    // solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La extension no es valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo a un PATH
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error. No se puede mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Peticion realizada correctamente',
        //     nombreArchivo: nombreArchivo
        // });
    })

});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            // si no existe el usuario emnsaje de error
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // si existe el archivo, se borra
            if (fs.exists(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Usuario actualizada',
                    usuarioActualizado: usuarioActualizado
                });

            });

        })

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;

            // si existe el archivo, se borra
            if (fs.exists(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Medico actualizada',
                    medicoActualizado: medicoActualizado
                });

            });

        })
    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // si existe el archivo, se borra
            if (fs.exists(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                });

            });

        })
    }
}

module.exports = app;