import { getApp } from '../../src/app'
import fastify from 'fastify'

describe('healthcheck', () => {
  let app: fastify.FastifyInstance
  beforeEach(async () => {
    app = await getApp()
  })

  afterEach(() => {
    return app.close()
  })

  it('Returns health check information', async () => {
    // @ts-ignore
    const response = await app.inject().get('/health')

    expect(response.statusCode).toEqual(200)
    expect(response.json()).toMatchSnapshot()
  })
})
