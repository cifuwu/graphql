const mongoose = require('mongoose');


const productoSchema = new mongoose.Schema({
    nombre: String,
    precio: String,
    descripccion: String
}) 


module.exports = mongoose.model('producto', productoSchema);