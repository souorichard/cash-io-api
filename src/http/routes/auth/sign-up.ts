import { FastifyInstance } from 'fastify'
import { db } from '../../../db'
import { z } from 'zod'

const signUpSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string()
})

export async function signUp(app: FastifyInstance) {
  app.post('/sign-up', async (request, reply) => {
    try {
      const { name, email, phone } = signUpSchema.parse(request.body)

      const userExist = await db.user.findUnique({
        where: {
          email
        }
      })

      if (!userExist) {
        const newUser = await db.user.create({
          data: {
            name, email, phone
          }
        })

        return reply.status(201).send({ userEmail: newUser.email })
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