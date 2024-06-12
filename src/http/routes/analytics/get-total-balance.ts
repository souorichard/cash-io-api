import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { decodeToken } from '../../../utils/decode-token'
import { expenseTransactions } from '../../../utils/expense-transactions'
import { revenueTransactions } from '../../../utils/revenue-transactions'

export async function getTotalBalance(app: FastifyInstance) {
  app.get('/transactions/total-balance', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = await decodeToken(request, reply)

      const expense = await expenseTransactions(id)
      const revenue = await revenueTransactions(id)

      const totalBalance = revenue - expense

      return reply.status(200).send(totalBalance)
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}