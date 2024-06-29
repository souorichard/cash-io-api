import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { decodeToken } from '../../../utils/decode-token'
import { z } from 'zod'

const filterQuerySchema = z.object({
  description: z.string().optional(),
  category: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export async function getTransactions(app: FastifyInstance) {
  app.get('/transactions', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id } = await decodeToken(request, reply)

      const { description, category, page = 0, limit = 10 } = filterQuerySchema.parse(request.query)

      const transactions = await db.transaction.findMany({
        where: {
          description: {
            contains: description,
            mode: 'insensitive',
          },
          category,
          createdById: id
        },
        skip: Number(page),
        take: Number(limit),
        orderBy: {
          createdAt: 'desc'
        }
      })

      const totalTransactions = await db.transaction.count({
        where: {
          createdById: id
        }
      })

      return reply.status(200).send({
        transactions,
        meta: {
          total: totalTransactions,
          page: Number(page),
          perPage: Number(limit)
        }
      })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}