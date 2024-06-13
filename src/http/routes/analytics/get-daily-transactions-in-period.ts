import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { decodeToken } from '../../../utils/decode-token'
import { db } from '../../../lib/db'
import { z } from 'zod'
import dayjs from 'dayjs'

const periodParamsSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

export async function getDailyTransactionsInPeriod(app: FastifyInstance) {
  app.get('/transactions/period', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { from, to } = periodParamsSchema.parse(request.query)

      const { id } = await decodeToken(request, reply)

      const startDate = from ? dayjs(from) : dayjs().subtract(7, 'd')
      const endDate = to ? dayjs(to) : from ? startDate.add(7, 'd') : dayjs()

      if (endDate.diff(startDate, 'days') > 7) {
        return reply.status(400).send({ message: 'Invalid Period' })
      }

      const transactionsPerDay = await db.transaction.findMany({
        select: {
          amount: true,
          createdAt: true
        },
        where: {
          createdById: id,
          createdAt: {
            gte: startDate.startOf('day').add(startDate.utcOffset(), 'minutes').toDate(),
            lte: endDate.endOf('day').add(endDate.utcOffset(), 'minutes').toDate()
          },
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      return reply.status(200).send(transactionsPerDay)
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}