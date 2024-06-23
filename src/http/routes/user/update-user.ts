import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { decodeToken } from '../../../utils/decode-token'

const updateUserSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  teamName: z.string(),
})

export async function updateUser(app: FastifyInstance) {
  app.put('/users', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { name, email, phone, teamName } = updateUserSchema.parse(request.body)

      const { id } = await decodeToken(request, reply)

      const verifyUser = await db.user.findUnique({
        where: {
          id
        }
      })

      if (!verifyUser) {
        return reply.status(404).send({ message: 'User not found.' })
      }

      await db.user.update({
        where: {
          id
        },
        data: {
          name,
          email,
          phone,
          teamName
        }
      })

      return reply.status(200).send({ message: 'User sucessfully updated.' })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}