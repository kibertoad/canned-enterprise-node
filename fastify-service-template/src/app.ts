import fastify from 'fastify'
import fastifyHelmet from 'fastify-helmet'
import fastifyCors from 'fastify-cors'

const healthCheck = require('fastify-healthcheck')

export async function getApp(): Promise<fastify.FastifyInstance> {
  const app = fastify({ logger: true })

  app.register(fastifyHelmet)
  app.register(healthCheck)

  app.register(fastifyCors, {
    methods: ['GET', 'POST'],
    credentials: false,
    maxAge: 86400,
    origin: []
  })

  try {
    await app.ready()
  } catch (err) {
    app.log.error('Error while initializing app: ', err)
    throw err
  }

  return app
}
