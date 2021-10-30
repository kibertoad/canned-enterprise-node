import { config } from 'dotenv'
import { Knex } from 'knex'

config()

const env = { ...process.env }

export type Config = {
  dbConfig: Knex.Config
  app: AppConfig
}

export type AppConfig = {
  port: number
  bindAddress: string
  tokenEncryptionKey: string
}

export function getConfig(): Config {
  return {
    app: getAppConfig(),
    dbConfig: getDbConfig(),
  }
}

export function getDbConfig(): Knex.Config {
  return {
    client: 'pg',
    connection: {
      user: getMandatory('SAMPLE_DB_USER'),
      password: getMandatory('SAMPLE_DB_PASSWORD'),
      database: getOptionalNullable('SAMPLE_DB_DATABASE', null) as string,
      host: getMandatory('SAMPLE_DB_SERVER'),
      port: getMandatoryInteger('SAMPLE_DB_PORT'),
      ssl: false,
    },
  }
}

export function getAppConfig(): AppConfig {
  return {
    port: getMandatoryInteger('SAMPLE_APP_PORT'),
    bindAddress: getMandatory('SAMPLE_APP_BIND_ADDRESS'),
    tokenEncryptionKey: getMandatory('SAMPLE_APP_TOKEN_ENCRYPTION_KEY'),
  }
}

export function getPort(): number {
  return Number.parseInt(getMandatory('DUMMY_APP_PORT'))
}

function getMandatoryInteger(param: string): number {
  if (!env[param]) {
    throw new Error(`Missing mandatory configuration parameter: ${param}`)
  }
  return Number.parseInt(env[param]!)
}

function getMandatory(param: string): string {
  if (!env[param]) {
    throw new Error(`Mandatory param ${param}`)
  }
  return env[param]!
}

function getOptionalNullable(param: string, defaultValue: string | null): string | null {
  return env[param] ?? defaultValue
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return env.NODE_ENV !== 'production'
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test'
}
