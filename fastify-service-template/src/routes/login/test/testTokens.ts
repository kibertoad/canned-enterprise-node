import { AccessTokenPayload, Permission } from '../utils/tokenUtils'

export const TEST_TOKEN_1: AccessTokenPayload = {
  userId: 1,
  permissions: {
    [Permission.ADMIN_USERS]: {},
  },
}

export const SUPER_ADMIN_TOKEN: AccessTokenPayload = {
  userId: 1,
  permissions: Object.values(Permission).reduce((result, permission) => {
    result[permission] = {}
    return result
  }, {} as Record<string, any>),
}

export const ORG_ADMIN_TOKEN: AccessTokenPayload = {
  userId: 1,
  permissions: {
    [Permission.ADMIN_USERS]: {},
  },
}
