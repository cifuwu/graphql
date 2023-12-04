const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const { ApolloServer, gql } = require('apollo-server-express');


//const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');
//const {makeExecutableSchema} = require('graphql-tools');


const {merge} = require('lodash');


const Usuario = require('./models/usuario');
const Producto = require('./models/producto');
const Pedido = require('./models/pedido');


mongoose.connect('mongodb+srv://cifu:123@lp.kh0voxn.mongodb.net/lp',{useNewUrlParser: true, useUnifiedTopology: true});

const typeDefs = gql`
	type Usuario {
		id: ID!
		nombre: String!
		correo: String
		caca: String
	}

	type Alert{
		message: String
	}

	type Foto {
		id: ID!
		url: String
	}

  type Producto {
		id: ID!
		nombre: String!
		precio: Int!
		descripccion: String,
		fotos: [Foto],
		categoria: String,
	}


	input FotoInput {
		url: String
	}

	input ProductoInput {
		nombre: String!
		precio: Int!
		descripccion: String,
		categoria: String,
	}

	type Query {
		usuarioCount: Int!
		allUsuarios: [Usuario]!
		findUsuario(nombre: String!): Usuario
		allProductos: [Producto]!
		findProductoById(id: ID!): Producto 
		getUrlPago(valor: Int!): Alert
		getEstadoPago(token: String!): Alert
	}

	type Mutation {
		addProducto(input: ProductoInput): Producto
		updateProducto(id: ID!, input: ProductoInput): Producto
		deleteProducto(id: ID!): Alert
		agregarFotoAProducto(productoId: ID!, foto: FotoInput): Producto
	}

`


const resolvers = {
	Query: {
		usuarioCount: async () => {
			const usuarios = await Usuario.find()
			return usuarios.length
		},
		allUsuarios: async () => {
				const usuarios = await Usuario.find()
				return usuarios
			},
		allProductos: async () => {
			const productos = await Producto.find()
			return productos
		},
		findUsuario: async (root, args) => {
			const {nombre} = args
			return await Usuario.find(user => user.nombre == nombre)
		},
		async findProductoById(obj, {id}){
			const producto = await Producto.findById(id);
			return producto;
		},
		async getUrlPago(obj, {valor}){
			const resp = await fetch("https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions",
				{
				headers: {'Content-Type' : 'application/json',
									'Tbk-Api-Key-Id': '597055555532',
									'Tbk-Api-Key-Secret': '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'
									},
				method: 'post',
				body: JSON.stringify(
					{
						"buy_order": "ordenCompra12345678",
						"session_id": "sesion1234557545",
						"amount": valor,
						"return_url": "http://localhost:3000/pedido"
					})})
			.then(result => result.json())
			.catch(err => console.log(err))

			return {
				message: `${resp.url}?token_ws=${resp.token}`
			}
		},

		async getEstadoPago(obj, {token}){
			const resp = await fetch(`https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`,
				{
				headers: {'Content-Type' : 'application/json',
									'Tbk-Api-Key-Id': '597055555532',
									'Tbk-Api-Key-Secret': '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'
									},
				method: 'put',
			})
			.then(result => result.json())
			.catch(err => console.log(err))

			return {
				message: resp.status
			}
		},
	},
	Mutation: {
		async addProducto(obj, {input}){
			const producto = new Producto(input);
			await producto.save();
			return producto;
		},
		async updateProducto(obj, {id, input}){
			const producto = await Producto.findByIdAndUpdate(id, input);
			return producto;
		},
		async deleteProducto(obj, {id}){
			await Producto.deleteOne({_id : id})
			return {
				message: "Producto eliminado correctamente"
			}
		},
		agregarFotoAProducto: async (parent, { productoId, foto }, context, info) => {
      try {
        const producto = await Producto.findById(productoId);
        if (!producto) {
          throw new Error('Producto no encontrado');
        }
        producto.fotos.push(foto);
        await producto.save();

        return producto;
      } catch (error) {
        throw new Error(`Error al agregar foto a producto: ${error.message}`);
      }
    },
		
	}

}


let apolloServer = null;


const corsOptions = {
    origin: "http://localhost:8090",
    Credentials: false
}


async function startServer(){
    const apolloServer = new ApolloServer({typeDefs, resolvers, corsOptions});
    await apolloServer.start();

    apolloServer.applyMiddleware({app, cors: false});
}

startServer();

const app = express()
app.use(cors());
app.listen(8090, function(){
  console.log('servidor iniciado');
})
