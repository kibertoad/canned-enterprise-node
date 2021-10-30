import type { AwilixContainer } from 'awilix'
import { asClass, asFunction, Lifetime } from 'awilix'
import type { FastifyInstance, FastifyLoggerInstance } from 'fastify'
import knex, { Knex } from 'knex'
import P, { pino } from 'pino'
import { Config, getConfig } from './config'
import { LoginService } from '../routes/login/services/LoginService'

export type ExternalDependencies = {
  app?: FastifyInstance
  logger?: P.Logger
}
const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }

export function registerDependencies(
  diContainer: AwilixContainer,
  dependencies: ExternalDependencies = {},
): void {
  const diConfig: DiConfig = {
    // Internal system
    app: asFunction(() => dependencies.app ?? undefined, {
      lifetime: Lifetime.SINGLETON,
    }),

    logger: asFunction(() => dependencies.logger ?? pino(), {
      lifetime: Lifetime.SINGLETON,
    }),

    config: asFunction(() => {
      return getConfig()
    }, SINGLETON_CONFIG),

    knex: asFunction(
      (dependencies: Dependencies) => {
        return knex({
          ...dependencies.config.dbConfig,
          migrations: {
            directory: 'migration/migrations',
          },
          seeds: {
            directory: 'migration/seeds',
          },
        })
      },
      {
        lifetime: Lifetime.SINGLETON,
        dispose: (module: Knex) => module.destroy(),
      },
    ),

    loginService: asClass(LoginService, SINGLETON_CONFIG),
  }
  diContainer.register(diConfig)
}

type DiConfig = Record<keyof Dependencies, any>

export interface Dependencies {
  // Internal system
  app: FastifyInstance
  knex: Knex
  config: Config
  logger: FastifyLoggerInstance & P.Logger

  //Login
  loginService: LoginService
}

declare module 'fastify-awilix' {
  interface Cradle extends Dependencies {}

  interface RequestCradle extends Dependencies {}
}
