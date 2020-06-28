import Koa, { Middleware } from 'koa'
import Router from 'koa-router'
import Application from 'koa'

function getMiddleware(): readonly Middleware[] {
  return []
}

function getRouters(): readonly Router[] {
  return []
}

function getApp(): Application {
  const app = new Koa()

  const appMiddleware = getMiddleware()
  appMiddleware.forEach((middlewareEntry: Middleware) => {
    app.use(middlewareEntry)
  })

  const appRouters = getRouters()
  appRouters.forEach((router: Router) => {
    app.use(router.routes()).use(router.allowedMethods())
  })

  return app
}

module.exports = {
  getApp,
}
