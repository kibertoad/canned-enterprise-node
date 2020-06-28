import { config } from 'dotenv'

config()

const env = { ...process.env }

export const USE_PRETTY_LOGS = getOptionalBoolean('DUMMY_APP_USE_PRETTY_LOGS', false)
export const LOG_LEVEL = getOptional('DUMMY_APP_LOG_LEVEL', 'info')

export function getAwsConfig() {
  return {
    s3ForcePathStyle: env['AWS_S3_FORCE_PATH_STYLE']?.toLowerCase() === 'true',
    accessKeyId: env['AWS_ACCESS_KEY_ID'],
    secretAccessKey: env['AWS_SECRET_ACCESS_KEY_ID'],
    endpoint: env['AWS_ENDPOINT'],
    bucket: getMandatory('AWS_BUCKET_NAME')
  }
}

export function getPort(): number {
  return Number.parseInt(getMandatory('DUMMY_APP_PORT'))
}

function getMandatory(param: string): string {
  if (!env[param]) {
    throw new Error(`Mandatory param ${param}`)
  }
  return env[param]!
}

function getOptional(param: string, defaultValue: string): string {
  return env[param] ?? defaultValue
}

function getOptionalBoolean(param: string, defaultValue: boolean): boolean {
  return env[param]?.toLowerCase() === 'true' ?? defaultValue
}

function getOptionalInteger(param: string, defaultValue: number): number {
  return env[param] ? Number.parseInt(env[param]!) : defaultValue
}

export function isProduction() {
  return env.NODE_ENV === 'production'
}

export function isDevelopment() {
  return env.NODE_ENV !== 'production'
}
