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

    type Usuario {
		id: ID!
		nombre: String!
        precio: String!
        descripccion: String
	}

	type Query {
		usuarioCount: Int!
		allUsuarios: [Usuario]!
		findUsuario(nombre: String!): Usuario
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
		findUsuario: async (root, args) => {
			const {nombre} = args
			return await Usuario.find(user => user.nombre == nombre)
		}
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
