import { AccessTokenPayload, Permission } from './tokenUtils'
import { TEST_TOKEN_1 } from '../test/testTokens'
import { tokenHasPermission } from './permissionChecker'

describe('authChecker', () => {
  describe('checkHasPermission', () => {
    it('allows if has permission', async () => {
      const token: AccessTokenPayload = {
        ...TEST_TOKEN_1,
      }

      const result = tokenHasPermission(token, Permission.ADMIN_USERS)

      expect(result).toBe(true)
    })

    it('denies if does not have permission', async () => {
      const token: AccessTokenPayload = {
        ...TEST_TOKEN_1,
      }

      const result = tokenHasPermission(token, Permission.ADMIN_SYS)

      expect(result).toBe(false)
    })
  })
})
