import { AccessTokenPayload, decodeJwtToken, generateJwtToken, Permission } from './tokenUtils'
import fastify from 'fastify'
import fastifyJWT from 'fastify-jwt'
import { ACCESS_TOKEN_TTL_IN_SECONDS } from '../services/LoginService'

describe('tokenUtils', () => {
  describe('generateJwtToken', () => {
    it('successfully generate jwt token', async () => {
      const app = fastify()
      app.register(fastifyJWT, {
        secret: 'secret',
      })
      await app.ready()

      const payload: AccessTokenPayload = {
        userId: 1,
        permissions: {
          [Permission.ADMIN_USERS]: {},
        },
      }

      const token = await generateJwtToken(app.jwt, payload, ACCESS_TOKEN_TTL_IN_SECONDS)
      const decodedToken = await decodeJwtToken(app.jwt, token)

      expect(decodedToken).toMatchObject({
        userId: 1,
        permissions: {
          [Permission.ADMIN_USERS]: {},
        },
        exp: expect.any(Number),
        iat: expect.any(Number),
      })
      expect(decodedToken.exp - decodedToken.iat).toEqual(ACCESS_TOKEN_TTL_IN_SECONDS)

      await app.close()
    })

    it('unsuccessfully decrypt jwt token', async () => {
      const app = fastify()
      app.register(fastifyJWT, {
        secret: 'secret',
      })
      await app.ready()

      const app2 = fastify()
      app2.register(fastifyJWT, {
        secret: 'secret2',
      })
      await app2.ready()

      const payload: AccessTokenPayload = {
        userId: 1,
        permissions: {
          [Permission.ADMIN_USERS]: {},
        },
      }

      const token = await generateJwtToken(app.jwt, payload, ACCESS_TOKEN_TTL_IN_SECONDS)

      await expect(() => {
        return decodeJwtToken(app2.jwt, token)
      }).rejects.toThrow('Auth error')

      await app.close()
      await app2.close()
    })
  })
})
