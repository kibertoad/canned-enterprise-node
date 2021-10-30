import { compare, hash } from 'bcrypt'

const SALT_ROUNDS = 10

export function encryptPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

export function verifyPassword(
  providedPassword: string,
  encryptedPassword: string,
): Promise<boolean> {
  return compare(providedPassword, encryptedPassword)
}
