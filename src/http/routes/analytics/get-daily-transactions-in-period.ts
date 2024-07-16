import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../../errors/client-error'
import dayjs from 'dayjs'

export async function getDailyTransactionsInPeriod(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/team/:teamId/transactions/period',
    {
      schema: {
        params: z.object({
          teamId: z.string().cuid()
        }),
        querystring: z.object({
          from: z.string().optional(),
          to: z.string().optional(),
        })
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request, reply) => {
      const { teamId } = request.params
      const { from, to } = request.query

      const team = await db.team.findUnique({
        where: {
          id: teamId
        }
      })

      if (!team) throw new ClientError('Team not found.')

      const startDate = from ? dayjs(from) : dayjs().subtract(7, 'd')
      const endDate = to ? dayjs(to) : from ? startDate.add(7, 'd') : dayjs()

      if (endDate.diff(startDate, 'days') > 7) {
        throw new ClientError('Invalid Period')
      }

      const transactions = await db.transaction.findMany({
        select: {
          amount_in_cents: true,
          created_at: true
        },
        where: {
          type: 'REVENUE',
          created_at: {
            gte: startDate.startOf('day').toDate(),
            lte: endDate.endOf('day').toDate()
          },
          team_id: teamId,
        },
        orderBy: {
          created_at: 'asc'
        }
      })

      const transactionsPerDay = transactions.reduce((acc, transactions) => {
        const date = dayjs(transactions.created_at).format('DD/MM')
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += transactions.amount_in_cents / 100
        return acc
      }, {} as Record<string, number>)

      const filteredTransactions = Object.entries(transactionsPerDay)
        .filter(([, amount]) => amount >= 1)
        .map(([date, amount]) => ({
          date,
          amount,
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
    
          return dateA.getTime() - dateB.getTime()
        }
      })

      return orderedTransactionsPerDay
    }
  )
}