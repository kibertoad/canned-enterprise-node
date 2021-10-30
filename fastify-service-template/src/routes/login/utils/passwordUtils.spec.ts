import { encryptPassword, verifyPassword } from './passwordUtils'

describe('Password Utils', () => {
  describe('encryptPassword', () => {
    it('Encrypts password correctly', async () => {
      const hash = await encryptPassword('123')
      const passwordCorrect = await verifyPassword('123', hash)
      expect(passwordCorrect).toBe(true)
    })
    it('Correctly indicates that password is incorrect', async () => {
      const hash = await encryptPassword('123')
      const passwordCorrect = await verifyPassword('456', hash)
      expect(passwordCorrect).toBe(false)
    })
  })
})
