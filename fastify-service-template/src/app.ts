import http from 'http'
import pino from 'pino'
import fastify, { FastifyInstance } from 'fastify'
import fastifyHelmet from 'fastify-helmet'
import fastifyCors from 'fastify-cors'
import middie from 'middie'

const healthCheck = require('fastify-healthcheck')

export async function getApp(): Promise<
  FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse, pino.Logger>
> {
  const app = fastify<http.Server, http.IncomingMessage, http.ServerResponse, pino.Logger>({
    logger: true
  })

  await app.register(middie)
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
