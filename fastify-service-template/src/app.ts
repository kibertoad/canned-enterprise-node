import http from 'http'
import pino from 'pino'
import fastify, { FastifyInstance } from 'fastify'
import { diContainer, fastifyAwilixPlugin } from 'fastify-awilix'
import { fastifySwagger } from 'fastify-swagger'
import fastifyHelmet from 'fastify-helmet'
import fastifyCors from 'fastify-cors'
import { registerDependencies } from './infrastructure/diConfig'
import type { AwilixContainer } from 'awilix'
import { getRoutes } from './routes/routes'
import { getAppConfig, isDevelopment } from './infrastructure/config'
import fastifyJWT from 'fastify-jwt'
import { jwtTokenPlugin } from './plugins/jwtTokenPlugin'
import fastifyAuth from 'fastify-auth'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { errorHandler } from './infrastructure/errorHandler'

const fastifyNoIcon = require('fastify-no-icon')
const healthCheck = require('fastify-healthcheck')

const ORIGINS = isDevelopment() ? '*' : []

export type ConfigOverrides = {
  diContainer?: AwilixContainer
}

export async function getApp(
  configOverrides: ConfigOverrides = {},
): Promise<FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse, pino.Logger>> {
  const app = fastify<http.Server, http.IncomingMessage, http.ServerResponse, pino.Logger>({
    logger: true,
  })

  const ajv = new Ajv({
    removeAdditional: true,
    useDefaults: true,

    coerceTypes: true,
    allErrors: true,
  })
  addFormats(ajv)

  // @ts-ignore
  app.setValidatorCompiler(({ schema }) => {
    return ajv.compile(schema)
  })

  const appConfig = getAppConfig()

  app.register(
    fastifyHelmet,
    isDevelopment()
      ? {
          contentSecurityPolicy: false,
        }
      : {},
  )
  app.register(healthCheck)
  app.register(fastifyNoIcon)
  app.register(fastifyAuth)
  app.register(fastifySwagger, {
    exposeRoute: true,
    openapi: {
      info: {
        title: 'SampleApi',
        description: 'Sample backend service',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${
            appConfig.bindAddress === '0.0.0.0' ? 'localhost' : appConfig.bindAddress
          }:${appConfig.port}`,
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })

  app.register(fastifyAwilixPlugin)

  app.register(fastifyCors, {
    credentials: false,
    maxAge: 86400,
    origin: ORIGINS,
  })

  app.register(fastifyJWT, {
    secret: appConfig.tokenEncryptionKey,
  })

  app.register(jwtTokenPlugin, {
    skipList: [
      '/login',
      '/access-token',
      '/refresh-token',
      '/documentation',
      '/documentation/json',
      '/health',
    ],
  })

  app.setErrorHandler(errorHandler)

  registerDependencies(configOverrides.diContainer ?? diContainer, {
    app: app,
    logger: app.log,
  })

  app.after(() => {
    const appRoutes = getRoutes(app)
    appRoutes.forEach((route) => {
      app.route(route)
    })
  })

  try {
    await app.ready()
  } catch (err) {
    app.log.error('Error while initializing app: ', err)
    throw err
  }

  return app
}
