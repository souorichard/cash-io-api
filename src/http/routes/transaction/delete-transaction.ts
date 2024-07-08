import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { decodeToken } from '../../../utils/decode-token'

const deleteTransactionSchema = z.object({
  id: z.string().cuid(),
})

export async function deleteTransaction(app: FastifyInstance) {
  app.delete('/transactions/:id', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = deleteTransactionSchema.parse(request.params)

      const { id: userId, team } = await decodeToken(request, reply)

      const verifyTransaction = await db.transaction.findUnique({
        where: {
          id,
          createdById: userId,
          teamId: team!.id
        }
      })

      if (!verifyTransaction) {
        return reply.status(404).send({ message: 'Transaction not found.' })
      }

      await db.transaction.delete({
        where: {
          id,
          createdById: userId,
          teamId: team!.id
        }
      })

      return reply.status(200).send({ message: 'Transaction successfully deleted.' })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}