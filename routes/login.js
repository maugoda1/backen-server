var express = require('express'); // Libreria principal para trabajar con el servidor

// Inicializar variables
var app = express();
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// variable para la Autenticación con google
// npm uninstall google-auth-library --save 
// npm install google-auth-library@0.12.0 --save  (OJO) solo funciona con esta version de la libreria 0.12.0
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

// Cosntantes traidas de config
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;


//=====================================
// Autenticación Google
//=====================================
app.post('/google', (req, res) => {

    var token = req.body.token || 'XXX';

    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        function(e, login) {

            if (e) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Token no valido',
                    errors: e
                });
            }

            var payload = login.getPayload();
            var userid = payload['sub'];
            // If request specified a G Suite domain:
            //const domain = payload['hd'];

            Usuario.findOne({ email: payload.email }, (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error al leer el usuario',
                        errors: err
                    });
                }

                if (usuario) {
                    if (!usuario.google) {
                        return res.status(400).json({
                            ok: true,
                            mensaje: 'Debe usar su autenticación normal'
                        });
                    } else {
                        // Crear Token
                        usuario.password = '********';

                        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });

                        res.status(201).json({
                            ok: true,
                            usuario: usuario,
                            token: token,
                            id: usuario._id
                        });

                    }
                    // si el usuario no existe por correo
                } else {

                    var usuario = new Usuario();

                    usuario.nombre = payload.nombre;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.role = 'USER_ROLE';
                    usuario.google = true;

                    usuario.save((err, usuarioDB) => {
                        if (err) {
                            return res.status(500).json({
                                ok: true,
                                mensaje: 'Error al guardar el usuario - google',
                                errors: err
                            });
                        }

                        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                        res.status(200).json({
                            ok: true,
                            usuario: usuarioDB,
                            token: token
                        });

                    });

                }

            });

        });

});


//=====================================
// Autenticación normal
//=====================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - Password',
                errors: err
            });
        }

        // Crear Token
        usuarioDB.password = '********';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(201).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });

});

module.exports = app;