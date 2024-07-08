import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { decodeToken } from '../../../utils/decode-token'
import { db } from '../../../lib/db'

export async function getRecentTransactionOwners(app: FastifyInstance) {
  app.get('/analytics/recent', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = await decodeToken(request, reply)

      const transactions = await db.transaction.findMany({
        include: {
          createdBy: {
            select: {
              name: true,
              email: true
            }
          }
        },
        where: {
          createdById: id
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const recentTransactions = transactions.slice(0, 6)

      return reply.status(200).send({ transactions: recentTransactions })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}