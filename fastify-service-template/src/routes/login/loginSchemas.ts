import { FastifySchema } from 'fastify/types/schema'

export const LOGIN_SCHEMA: FastifySchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', maxLength: 32 },
      password: { type: 'string', maxLength: 32 },
    },
  },
}

export const ACCESS_TOKEN_SCHEMA: FastifySchema = {
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string' },
    },
  },
}

export const REFRESH_TOKEN_SCHEMA: FastifySchema = {
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string' },
    },
  },
}
