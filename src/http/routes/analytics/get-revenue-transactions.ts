import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { decodeToken } from '../../../utils/decode-token'

export async function getRevenueTransactions(app: FastifyInstance) {
  app.get('/transactions/revenue', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = await decodeToken(request, reply)

      const transactions = await db.transaction.findMany({
        where: {
          createdById: id,
          type: 'REVENUE'
        }
      })

      let revenueTransactions = 0

      for (let i = 0; i < transactions.length; i++) {
        revenueTransactions += transactions[i].amount  
      }

      return reply.status(200).send(revenueTransactions)
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}