import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { decodeToken } from '../../../utils/decode-token'
import { expenseTransactions } from '../../../utils/expense-transactions'
import { revenueTransactions } from '../../../utils/revenue-transactions'

export async function getTotalBalance(app: FastifyInstance) {
  app.get('/analytics/total', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id, team } = await decodeToken(request, reply)

      const { transactions: expense } = await expenseTransactions(id, team!.id)
      const { transactions: revenue } = await revenueTransactions(id, team!.id)

      return reply.status(200).send({
        totalBalanceInCents: revenue - expense
      })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}