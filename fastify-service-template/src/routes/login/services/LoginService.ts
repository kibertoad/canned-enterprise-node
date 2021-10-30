import { JWT } from 'fastify-jwt'
import { Dependencies } from '../../../infrastructure/diConfig'
import {
  AccessTokenPayload,
  decodeJwtToken,
  FullRefreshTokenPayload,
  generateJwtToken,
  RefreshTokenPayload,
} from '../utils/tokenUtils'
import { verifyPassword } from '../utils/passwordUtils'
import { PublicError } from '../../../infrastructure/PublicError'

export const ACCESS_TOKEN_TTL_IN_SECONDS = 60 * 5
export const REFRESH_TOKEN_TTL_IN_SECONDS = 60 * 120

type Tokens = {
  accessToken: string
  refreshToken: string
}

export class LoginService {
  private readonly jwt: JWT

  constructor({ app }: Dependencies) {
    this.jwt = app.jwt
  }

  private async getRefreshToken(userId: number): Promise<string> {
    const refreshTokenPayload: RefreshTokenPayload = {
      userId,
    }

    return await generateJwtToken(this.jwt, refreshTokenPayload, REFRESH_TOKEN_TTL_IN_SECONDS)
  }

  private async getAccessToken(userId: number): Promise<string> {
    const permissions = {} // ToDo replace with real implementation
    const accessTokenPayload: AccessTokenPayload = {
      userId,
      permissions,
    }
    return await generateJwtToken(this.jwt, accessTokenPayload, ACCESS_TOKEN_TTL_IN_SECONDS)
  }

  async renewRefreshToken(refreshToken: string): Promise<string> {
    const decodedRefreshToken: FullRefreshTokenPayload = await decodeJwtToken(
      this.jwt,
      refreshToken,
    )
    const { userId } = decodedRefreshToken

    // ToDo add whatever validations necessary

    return await this.getRefreshToken(userId)
  }

  async renewAccessToken(refreshToken: string): Promise<string> {
    const decodedRefreshToken: FullRefreshTokenPayload = await decodeJwtToken(
      this.jwt,
      refreshToken,
    )
    const { userId } = decodedRefreshToken

    // ToDo Add whatever validations necessary

    return await this.getAccessToken(userId)
  }

  async login(username: string, password: string): Promise<Tokens> {
    // ToDo implement actual storage
    const passwordHash = 'abc'
    const userId = 1

    const isPasswordValid = await verifyPassword(password, passwordHash)
    if (!isPasswordValid) {
      throw new PublicError('Authentication failed', 403, 'AUTH_ERROR')
    }

    const refreshToken = await this.getRefreshToken(userId)
    const accessToken = await this.getAccessToken(userId)

    return {
      accessToken,
      refreshToken,
    }
  }
}
