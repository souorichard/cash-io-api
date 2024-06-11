import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from '../db'

const tokenSchema = z.object({
  id: z.string(),
  email: z.string().email()
})

export function generateToken({ id, email }: z.infer<typeof tokenSchema>) {
  const token = jwt.sign({ id, email }, String(process.env.JWT_SECRET), { expiresIn: '1d' })

  return token
}

export async function verifyToken(token: string) {
  const { email } = tokenSchema.parse(jwt.verify(token, String(process.env.JWT_SECRET)))

  const user = await db.user.findUnique({
    where: {
      email
    }
  })

  return user
}

interface AuthenticateType {
  request: FastifyRequest
  reply: FastifyReply
  done: HookHandlerDoneFunction
}

export async function isAuthenticated({ request, reply, done }: AuthenticateType) {
  const token = request.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return reply.status(401).send({ message: 'Unauthorized! Token not found' })
  }

  const user = await verifyToken(token)

  if (!user) {
    return reply.status(404).send({ message: 'Unauthorized! Invalid token' })
  }

  done()
}