import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { decodeToken } from '../../../utils/decode-token'
import { expenseTransactions } from '../../../utils/expense-transactions'

export async function getExpenseTransactions(app: FastifyInstance) {
  app.get('/analytics/expense', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id, team } = await decodeToken(request, reply)

      const { transactions, diffFromLastMonth } = await expenseTransactions(id, team!.id)

      return reply.status(200).send({
        expenseAmountInCents: transactions,
        diffFromLastMonth
      })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}