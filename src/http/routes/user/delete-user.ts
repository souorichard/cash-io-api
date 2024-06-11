import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../db'
import { decodeToken } from '../../../utils/decode-token'

export async function deleteUser(app: FastifyInstance) {
  app.delete('/users', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = await decodeToken(request, reply)

      const verifyUser = await db.user.findUnique({
        where: {
          id,
        }
      })

      if (!verifyUser) {
        return reply.status(404).send({ message: 'User not found.' })
      }

      await db.transaction.delete({
        where: {
          id
        }
      })

      return reply.status(200).send({ message: 'User sucessfully deleted.' })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}