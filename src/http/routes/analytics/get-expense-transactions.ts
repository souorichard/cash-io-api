import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { decodeToken } from '../../../utils/decode-token'
import { expenseTransactions } from '../../../utils/expense-transactions'

export async function getExpenseTransactions(app: FastifyInstance) {
  app.get('/transactions/expense', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = await decodeToken(request, reply)

      const transactions = await expenseTransactions(id)

      return reply.status(200).send(transactions)
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}