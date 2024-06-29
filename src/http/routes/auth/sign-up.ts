import { FastifyInstance } from 'fastify'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { hashPassword } from '../../../utils/hashPassword'

const signUpSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string()
})

export async function signUp(app: FastifyInstance) {
  app.post('/sign-up', async (request, reply) => {
    try {
      const { name, email, password, phone } = signUpSchema.parse(request.body)

      const userExist = await db.user.findUnique({
        where: {
          email
        }
      })

      if (!userExist) {
        const hashedPassword = hashPassword(password)

        await db.user.create({
          data: {
            name, email, password: hashedPassword, phone
          }
        })

        return reply.status(201).send({ message: "User registered successfully." })
      }

      return reply.status(409).send({
        message: 'Email already in use.'
      })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}