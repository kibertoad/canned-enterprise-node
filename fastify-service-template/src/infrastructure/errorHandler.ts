import { FastifyRequest } from 'fastify/types/request'
import { FastifyReply } from 'fastify/types/reply'
import { FastifyInstance } from 'fastify'
import { PublicError } from './PublicError'
import { isDevelopment as isDevelopmentFn } from './config'

const isDevelopment = isDevelopmentFn()

export type ErrorHandler = (
  this: FastifyInstance,
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
) => void

export const errorHandler: ErrorHandler = function (
  this: FastifyInstance,
  error: any,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  this.log.error(`error: ${error.message}`, error.stack)
  if (isDevelopment) {
    console.error(error.stack)
  }

  if (error.validation) {
    reply.status(400).send({
      message: error.message,
      statusCode: 400,
      error: 'Bad Request',
    })
    return
  }
  if (error.name === 'UnauthorizedError') {
    reply.status(401).send('No Authorization was found in request headers')
    return
  }
  if (error instanceof PublicError) {
    reply
      .status(error.httpCode)
      .send({ message: error.message, errorCode: error.errorCode, metadata: error.metadata })
    return
  }
  reply.status(500).send('Internal server error')
}
