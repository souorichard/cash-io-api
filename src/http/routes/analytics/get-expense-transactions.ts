import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { decodeToken } from '../../../utils/decode-token'

export async function getExpenseTransactions(app: FastifyInstance) {
  app.get('/transactions/expense', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = await decodeToken(request, reply)

      const transactions = await db.transaction.findMany({
        where: {
          createdById: id,
          type: 'EXPENSE'
        }
      })

      if (!transactions) {
        return reply.status(404).send({ message: 'Transactions not found.' })
      }

      let expenseTransactions = 0

      for (let i = 0; i < transactions.length; i++) {
        expenseTransactions += transactions[i].amount  
      }

      return reply.status(200).send(expenseTransactions)
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}