import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { decodeToken } from '../../../utils/decode-token'
import { revenueTransactions } from '../../../utils/revenue-transactions'

export async function getRevenueTransactions(app: FastifyInstance) {
  app.get('/analytics/revenue', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id, team } = await decodeToken(request, reply)

      const { transactions, diffFromLastMonth } = await revenueTransactions(id, team!.id)

      return reply.status(200).send({
        revenueAmountInCents: transactions,
        diffFromLastMonth
      })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}