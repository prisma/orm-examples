const { ApolloServer } = require('apollo-server')
const { schema } = require('./schema')
const { context } = require('./context')

const server = new ApolloServer({ schema, context: context })

server.listen().then(({ url }) =>
  console.log(`
🚀 Server ready at: ${url}
⭐️ See sample queries: http://pris.ly/e/js/graphql-sdl-first#using-the-graphql-api`),
)
