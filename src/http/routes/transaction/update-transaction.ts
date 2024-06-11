import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../db'
import { z } from 'zod'
import { decodeToken } from '../../../utils/decode-token'

const updateTransactionSchema = z.object({
  id: z.string().cuid().optional(),
  description: z.string(),
  category: z.string(),
  amount: z.coerce.number(),
  type: z.enum(['EXPENSE', 'REVENUE']),
})

export async function updateTransaction(app: FastifyInstance) {
  app.put('/transactions', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id, description, category, amount, type } = updateTransactionSchema.parse(request.body)

      const { id: userId } = await decodeToken(request, reply)

      const verifyTransaction = await db.transaction.findUnique({
        where: {
          id,
          createdById: userId
        }
      })

      if (!verifyTransaction) {
        return reply.status(404).send({ message: 'Transaction not found.' })
      }

      await db.transaction.update({
        where: {
          id,
          createdById: userId
        },
        data: {
          description,
          category,
          amount,
          type,
        }
      })

      return reply.status(200).send({ message: 'Transaction sucessfully updated.' })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}