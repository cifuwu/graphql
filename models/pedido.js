const mongoose = require('mongoose');


const pedidoSchema = new mongoose.Schema({
    total: String,
    direccion: String
}) 


module.exports = mongoose.model('pedido', pedidoSchema);