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
  sortDate: z.string().optional(),
})

export async function getTransactions(app: FastifyInstance) {
  app.get('/transactions', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { id, team } = await decodeToken(request, reply)

      const { description, category, page, limit, sortDate } = filterQuerySchema.parse(request.query)

      const transactions = await db.transaction.findMany({
        select: {
          id: true,
          description: true,
          category: true,
          amountInCents: true,
          type: true,
          createdAt: true,
        },
        where: {
          description: {
            contains: description,
            mode: 'insensitive',
          },
          category,
          createdById: id,
          teamId: team!.id,
        },
        skip: page ? Number(page) * 10 : 0,
        take: limit ? Number(limit) : 10,
        orderBy: {
          createdAt: sortDate === 'asc' ? 'asc' : 'desc'
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
          page: page ? Number(page) : 0,
          perPage: limit ? Number(limit) : 10
        }
      })
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}