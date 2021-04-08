import { ApolloServer } from 'apollo-server'
import { schema } from './schema'
import { context } from './context'

new ApolloServer({ schema, context: context }).listen({ port: 4000 }, () =>
  console.log(`
🚀 Server ready at: http://localhost:4000
⭐️ See sample queries: http://pris.ly/e/ts/graphql-sdl-first#using-the-graphql-api`),
)
