const mongoose = require('mongoose');


const usuarioSchema = new mongoose.Schema({
    nombre: String,
    correo: String
}) 


module.exports = mongoose.model('usuario', usuarioSchema);