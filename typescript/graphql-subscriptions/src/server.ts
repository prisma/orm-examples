import { ApolloServer } from 'apollo-server'
import { schema } from './schema'
import { context } from './context'

const PORT = process.env.PORT || 4000

const server = new ApolloServer({
  schema: schema,
  context: context,
  playground: true,
  cors: true,
})

server.listen({ port: PORT }).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`)
  console.log(`⏰ Subscriptions ready at ${subscriptionsUrl}`)
  console.log(
    `⭐️ See sample queries: http://pris.ly/e/ts/graphql-subscriptions#using-the-graphql-api`,
  )
})
