import { FastifyInstance, RouteOptions } from 'fastify'
import { loginRoutes } from './login/loginRoutes'

export function getRoutes(app: FastifyInstance) {
  const routes: RouteOptions<any, any, any, any>[] = [...loginRoutes]
  return routes
}
