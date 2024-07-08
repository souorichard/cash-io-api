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
  app.get('/analytics/period', {
    preHandler: (request, reply, done) => {
      isAuthenticated({ request, reply, done })
    }
  }, async (request, reply) => {
    try {
      const { from, to } = periodParamsSchema.parse(request.query)

      const { id, team } = await decodeToken(request, reply)

      const startDate = from ? dayjs(from) : dayjs().subtract(7, 'd')
      const endDate = to ? dayjs(to) : from ? startDate.add(7, 'd') : dayjs()

      if (endDate.diff(startDate, 'days') > 7) {
        return reply.status(400).send({ message: 'Invalid Period' })
      }

      const transactions = await db.transaction.findMany({
        select: {
          amountInCents: true,
          createdAt: true
        },
        where: {
          createdAt: {
            gte: startDate.startOf('day').toDate(),
            lte: endDate.endOf('day').toDate()
          },
          createdById: id,
          teamId: team!.id,
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      const transactionsPerDay = transactions.reduce((acc, transactions) => {
        const date = dayjs(transactions.createdAt).format('DD/MM')
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += transactions.amountInCents;
        return acc
      }, {} as Record<string, number>)

      const filteredTransactions = Object.entries(transactionsPerDay)
        .filter(([, amountInCents]) => amountInCents >= 1)
        .map(([date, amountInCents]) => ({
          date,
          amountInCents,
        }))

      const orderedTransactionsPerDay = filteredTransactions.sort((a, b) => {
        const [dayA, monthA] = a.date.split('/').map(Number)
        const [dayB, monthB] = b.date.split('/').map(Number)
    
        if (monthA === monthB) {
          return dayA - dayB
        } else {
          const currentYear = new Date().getFullYear()

          const dateA = new Date(currentYear, monthA - 1)
          const dateB = new Date(currentYear, monthB - 1)
    
          return dateA.getTime() - dateB.getTime();
        }
      })

      return reply.status(200).send(orderedTransactionsPerDay)
    } catch (err) {
      return reply.status(500).send({
        message: 'Internal server error.'
      })
    }
  })
}