const mongoose = require('mongoose');


const productoSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    descripccion: String,
    fotos: [{ url: String }],
    categoria: String
}) 


module.exports = mongoose.model('producto', productoSchema);