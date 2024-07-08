import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { decodeToken } from '../../../utils/decode-token'

export async function getProfile(app: FastifyInstance) {
  app.get('/me', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = await decodeToken(request, reply)

      const user = await db.user.findUnique({
        where: {
          id
        }
      })

      if (!user) {
        return reply.status(404).send({ message: 'User not found.' })
      }

      return reply.status(200).send(user)
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}