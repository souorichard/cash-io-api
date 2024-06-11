import { FastifyInstance } from 'fastify'
import { isAuthenticated, verifyToken } from '../../authentication'
import { db } from '../../../db'
import { z } from 'zod'
import { decodeToken } from '../../../utils/decode-token'

export async function getTransactions(app: FastifyInstance) {
  app.get('/transactions', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = await decodeToken(request, reply)

      const transactions = await db.transaction.findMany({
        where: {
          id
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return reply.status(200).send(transactions)
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}