import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../../errors/client-error'
import dayjs from 'dayjs'

export async function getTransactions(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/team/:teamId/transactions',
    {
      schema: {
        params: z.object({
          teamId: z.string().cuid()
        }),
        querystring: z.object({
          description: z.string().optional(),
          category: z.string().optional(),
          page: z.string().optional(),
          limit: z.string().optional(),
          sortDate: z.string().optional()
        })
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request) => {
      const { teamId } = request.params
      const { description, category, page, limit, sortDate } = request.query

      const team = await db.team.findUnique({
        where: {
          id: teamId
        }
      })

      if (!team) throw new ClientError('Team not found.')

      const rawTransactions = await db.transaction.findMany({
        where: {
          team_id: teamId,
          description: {
            contains: description,
            mode: 'insensitive',
          },
          category
        },
        include: {
          created_by: {
            select: {
              name: true
            }
          }
        },
        // select: {
        //   id: true,
        //   description: true,
        //   category: true,
        //   amount_in_cents: true,
        //   type: true,
        //   created_at: true,
        // },
        skip: page ? (Number(page) - 1) * 10 : 0,
        take: limit ? Number(limit) : 10,
        orderBy: {
          created_at: sortDate === 'asc' ? 'asc' : 'desc'
        }
      })

      const transactions = rawTransactions.map((transaction) => {
        return {
          ...transaction
        }
      })

      return {
        transactions,
        meta: {
          total: transactions.length,
          page: page ? Number(page) : 0,
          perPage: limit ? Number(limit) : 10
        }
      }
    }
  )
}