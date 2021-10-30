import { RouteOptions } from 'fastify'
import { ACCESS_TOKEN_SCHEMA, LOGIN_SCHEMA, REFRESH_TOKEN_SCHEMA } from './loginSchemas'
import { postAccessToken, postLogin, postRefreshToken } from './loginController'

export const loginRoutes: RouteOptions<any, any, any, any>[] = [
  {
    method: 'POST',
    url: '/login',
    handler: postLogin,
    schema: LOGIN_SCHEMA,
  },
  {
    method: 'POST',
    url: '/access-token',
    handler: postAccessToken,
    schema: ACCESS_TOKEN_SCHEMA,
  },
  {
    method: 'POST',
    url: '/refresh-token',
    handler: postRefreshToken,
    schema: REFRESH_TOKEN_SCHEMA,
  },
]
