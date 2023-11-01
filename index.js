import { ApolloServer, gql } from "apollo-server"

const persons = [
	{name: "caca",
	id: 1
	},
	{name: "caca 2",
	id: 2
	},
	{name: "caca 3",
	id: 3
	}
]


const typeDefs = gql`
	type Person {
		id: ID!
		name: String!
	}

	type Query {
		personCount: Int!
		allPersons: [Person]!
		findPerson(name: String!): Person
	}
`


const resolvers = {
	Query: {
		personCount: () => persons.length,
		allPersons: () => persons,
		findPerson: (root, args) => {
			const {name} = args
			return persons.find(person => person.name == name)
		}
	}
}


const server = new ApolloServer({
	typeDefs,
	resolvers
})

server.listen().then(({url})=>{
	console.log(`servidor corriendo en ${url}`)
})
