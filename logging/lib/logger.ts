import Pino, { Logger as PinoLogger, LoggerOptions, stdTimeFunctions } from 'pino'
import config from './config'
import { extendMeta } from './loggerUtils'
import { Context } from './types'

interface ValueMap {
  [key: string]: any
}

export const defaultPrettyPrintOptions = Object.freeze({
  translateTime: true
})

export const defaultOptions: LoggerOptions = Object.freeze({
  timestamp: stdTimeFunctions.epochTime,
  level: config.LOG_LEVEL,
  useLevelLabels: true,
  messageKey: 'message',
  prettyPrint: config.USE_PRETTY_LOGS || config.IS_DEVELOPMENT ? defaultPrettyPrintOptions : false,
  base: null
})

export class Logger {
  private pinoLogger: PinoLogger

  constructor(optionOverrides: Partial<LoggerOptions> = {}, loggerInstance?: PinoLogger) {
    this.pinoLogger =
      loggerInstance ||
      Pino({
        ...defaultOptions,
        ...optionOverrides
      })
  }

  info(ctx: Context | null, message: string, meta: object = {}): void {
    this.pinoLogger.info(extendMeta(ctx, meta), message)
  }

  debug(ctx: Context | null, message: string, meta: object = {}): void {
    this.pinoLogger.debug(extendMeta(ctx, meta), message)
  }

  warn(ctx: Context | null, message: string, meta: object = {}): void {
    const effectiveMeta = {
      ...extendMeta(ctx, meta)
    }
    this.pinoLogger.warn(effectiveMeta, message)
  }

  error(ctx: Context | null, message: string, err?: Error, meta: object = {}): void {
    const errLog = err ? err : {}
    const effectiveMeta = {
      ...extendMeta(ctx, meta),
      errLog
    }
    this.pinoLogger.error(effectiveMeta, message)
  }

  childLogger(baseValues: ValueMap): Logger {
    return new Logger(undefined, this.pinoLogger.child(baseValues))
  }
}

export const defaultLogger = new Logger()
