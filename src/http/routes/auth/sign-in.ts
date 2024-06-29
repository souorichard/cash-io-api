import { FastifyInstance } from 'fastify'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { generateToken } from '../../authentication'
import bcrypt from 'bcrypt'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export async function signIn(app: FastifyInstance) {
  app.post('/sign-in', async (request, reply) => {
    try {
      const { email, password } = signInSchema.parse(request.body)

      const userExist = await db.user.findUnique({
        where: {
          email
        }
      })

      if (userExist) {
        const { id, email, password: hashedPassword } = userExist

        if (bcrypt.compareSync(password, hashedPassword)) {
          const token = generateToken({ id ,email })

          return reply.status(200).send({ id, token })
        }

        return reply.status(400).send({
          message: 'Incorrect password.'
        })
      }

      return reply.status(400).send({
        message: 'Email not found.'
      })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}