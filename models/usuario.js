var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({
    nombre: { type: String, requered: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, requered: [true, 'El correo es necesario'] },
    password: { type: String, requered: [true, 'El password es necesario'] },
    img: { type: String },
    role: { type: String, requered: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, requered: true, default: false }

});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);