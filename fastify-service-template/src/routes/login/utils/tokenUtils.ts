import { JWT } from 'fastify-jwt'
import type { VerifyErrors } from 'jsonwebtoken'
import { PublicError } from '../../../infrastructure/PublicError'

export enum Permission {
  'ADMIN_SYS' = 'ADMIN_SYS',
  'ADMIN_ORG' = 'ADMIN_ORG',
  'ADMIN_USERS' = 'ADMIN_USERS',
}

export type UserPermission = { targetId?: number }

export type UserPermissions = { [key in Permission]?: UserPermission }

declare module 'fastify-jwt' {
  interface FastifyJWT {
    user: AccessTokenPayload
  }
}

export type RefreshTokenPayload = {
  userId: number
}

export type AccessTokenPayload = {
  userId: number
  permissions: UserPermissions
}

export type FullAccessTokenPayload = AccessTokenPayload & {
  exp: number // expires at
  iat: number // issued at
}

export type FullRefreshTokenPayload = RefreshTokenPayload & {
  exp: number // expires at
  iat: number // issued at
}

export function generateJwtToken(
  jwt: JWT,
  payload: Record<string, any>,
  ttlInSeconds: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, { expiresIn: ttlInSeconds }, (err, encoded) => {
      if (err) {
        return reject(err)
      }
      if (!encoded) {
        throw new Error('Empty token')
      }
      resolve(encoded)
    })
  })
}

export function decodeJwtToken(jwt: JWT, encodedToken: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(encodedToken, (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        return reject(err)
      }
      if (!decoded) {
        throw new Error('Empty token')
      }
      resolve(decoded)
    })
  }).catch((err) => {
    if (err.message === 'invalid signature') {
      throw new PublicError('Auth error', 401, 'AUTH_ERROR')
    }
    throw err
  })
}
