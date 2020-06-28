import { getApp } from '../../src/app'
import fastify, { FastifyInstance } from 'fastify'

describe('healthcheck', () => {
  let app: FastifyInstance
  beforeEach(async () => {
    app = await getApp()
  })

  afterEach(() => {
    return app.close()
  })

  it('Returns health check information', async () => {
    // @ts-ignore
    const response = await app
      .inject()
      .get('/health')
      .end()

    expect(response.statusCode).toEqual(200)
    expect(response.json()).toMatchSnapshot()
  })
})
