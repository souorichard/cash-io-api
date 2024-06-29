import bcrypt from 'bcrypt'

export function hashPassword(password: string) {
  const hashedPassword = bcrypt.hashSync(password, 10)

  return hashedPassword
}