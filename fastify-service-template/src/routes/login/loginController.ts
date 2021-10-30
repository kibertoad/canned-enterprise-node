import { FastifyReply, FastifyRequest, RequestGenericInterface } from 'fastify'

interface PostLoginRequest extends RequestGenericInterface {
  Body: {
    username: string
    password: string
  }
}

interface PostRefreshTokenRequest extends RequestGenericInterface {
  Body: {
    refreshToken: string
  }
}

export const postLogin = async (
  req: FastifyRequest<PostLoginRequest>,
  reply: FastifyReply,
): Promise<void> => {
  const { username, password } = req.body

  const { loginService } = req.diScope.cradle

  const tokens = await loginService.login(username, password)

  return reply.send({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  })
}

export const postRefreshToken = async (
  req: FastifyRequest<PostRefreshTokenRequest>,
  reply: FastifyReply,
): Promise<void> => {
  const { refreshToken } = req.body

  const { loginService } = req.diScope.cradle

  const newRefreshToken = await loginService.renewRefreshToken(refreshToken)

  return reply.send({
    refreshToken: newRefreshToken,
  })
}

export const postAccessToken = async (
  req: FastifyRequest<PostRefreshTokenRequest>,
  reply: FastifyReply,
): Promise<void> => {
  const { refreshToken } = req.body

  const { loginService } = req.diScope.cradle

  const newAccessToken = await loginService.renewAccessToken(refreshToken)

  return reply.send({
    accessToken: newAccessToken,
  })
}
