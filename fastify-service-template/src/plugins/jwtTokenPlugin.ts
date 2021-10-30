import type { FastifyInstance, HookHandlerDoneFunction } from 'fastify'
import { FastifyRequest } from 'fastify/types/request'
import { FastifyReply } from 'fastify/types/reply'
import fp from 'fastify-plugin'

export type JwtTokenPluginOptions = {
  skipList: string[]
  includeList?: string[]
}

function plugin(
  fastify: FastifyInstance,
  pluginOptions: JwtTokenPluginOptions,
  next: (err?: Error) => void,
) {
  let resolvedIncludeList: RegExp[]
  const resolvedSkipList: RegExp[] = pluginOptions.skipList.map((regexStr) => new RegExp(regexStr))

  if (pluginOptions?.includeList) {
    resolvedIncludeList = pluginOptions.includeList.map((regexStr) => new RegExp(regexStr))
  }

  fastify.addHook(
    'onRequest',
    (req: FastifyRequest, res: FastifyReply, done: HookHandlerDoneFunction) => {
      if (
        resolvedSkipList.some((skipListRegex) => {
          return skipListRegex.test(req.routerPath)
        })
      ) {
        return done()
      }

      if (
        resolvedSkipList.some((skipListRegex) => {
          return skipListRegex.test(req.routerPath)
        })
      ) {
        return done()
      }

      if (
        !resolvedIncludeList ||
        resolvedIncludeList.some((includeListRegex) => {
          return includeListRegex.test(req.routerPath)
        })
      ) {
        return req
          .jwtVerify()
          .then(() => done)
          .catch(done)
      }

      // includeList is enabled, and this route is not there
      return done()
    },
  )

  next()
}

export const jwtTokenPlugin = fp<JwtTokenPluginOptions>(plugin, {
  fastify: '3.x',
  name: 'jwt-token-plugin',
})
