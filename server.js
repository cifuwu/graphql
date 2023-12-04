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
		findProductoById(id: ID): Producto 
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
		findProductoById: async (root, args) => {
			const {id} = args
			return await Producto.find(producto => producto.id == id)
		}
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
