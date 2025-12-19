import { randomBytes, createHash, timingSafeEqual } from 'crypto'
import { sign, verify, JwtPayload } from 'jsonwebtoken'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const TOKEN_EXPIRATION = '1d'
const RESET_TOKEN_EXPIRATION = 3600000 // 1 hour in milliseconds

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex')
  return `${salt}:${hash}`
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':')
  const newHash = createHash('sha256')
    .update(password + salt)
    .digest('hex')
  return timingSafeEqual(Buffer.from(hash), Buffer.from(newHash))
}

export function generateToken(userId: string): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION })
}

export function verifyToken(token: string): string | JwtPayload {
  return verify(token, JWT_SECRET)
}

export async function generateResetToken(): Promise<string> {
  return randomBytes(32).toString('hex')
}

export async function validateResetToken(token: string, email: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      email,
      resetToken: token,
      resetTokenExp: {
        gt: new Date()
      }
    }
  })
  return !!user
}
