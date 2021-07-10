import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from 'fastify'
import mercurius from 'mercurius'
import { schema } from './schema'
import { context } from './context'

function createServer(opts: FastifyServerOptions = {}) {
  const server = fastify(opts)
  server.register(mercurius, {
    schema,
    context: (request: FastifyRequest, reply: FastifyReply) => {
      return context
    },
    graphiql: true,
  })

  return server
}

const start = async (server: FastifyInstance) => {
  try {
    const port = process.env.PORT ?? 3000
    await server.listen(port, '0.0.0.0')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

const server = createServer({
  logger: {
    level: 'info',
  },
})

start(server)
