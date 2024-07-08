import { FastifyInstance } from 'fastify'
import { isAuthenticated, verifyToken } from '../../authentication'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { decodeToken } from '../../../utils/decode-token'

const addTransactionSchema = z.object({
  id: z.string().cuid().optional(),
  description: z.string(),
  category: z.string(),
  amount: z.coerce.number(),
  type: z.enum(['EXPENSE', 'REVENUE']),
})

export async function addTransaction(app: FastifyInstance) {
  app.post('/transactions', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { description, category, amount, type } = addTransactionSchema.parse(request.body)

      const { id, team } = await decodeToken(request, reply)

      await db.transaction.create({
        data: {
          description,
          category,
          amountInCents: amount,
          type,
          createdById: id,
          teamId: team!.id
        }
      })

      return reply.status(201).send({ message: 'Transaction successfully created.' })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}