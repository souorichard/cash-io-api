import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { decodeToken } from '../../../utils/decode-token'
import { revenueTransactions } from '../../../utils/revenue-transactions'

export async function getRevenueTransactions(app: FastifyInstance) {
  app.get('/transactions/revenue', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = await decodeToken(request, reply)

      const transactions = await revenueTransactions(id)

      return reply.status(200).send(transactions)
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}