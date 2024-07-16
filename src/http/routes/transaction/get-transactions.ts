import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../../errors/client-error'

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
          page: z.coerce.number(),
          sortDate: z.string().optional()
        })
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request) => {
      const { teamId } = request.params
      const { description, category, page, sortDate } = request.query

      const team = await db.team.findUnique({
        where: {
          id: teamId
        }
      })

      if (!team) throw new ClientError('Team not found.')

      const transactions = await db.transaction.findMany({
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
        skip: page * 10,
        take: 10,
        orderBy: {
          created_at: sortDate === 'asc' ? 'asc' : 'desc'
        }
      })

      const totalCount = await db.transaction.count({
        where: {
          team_id: teamId
        }
      })

      return {
        transactions,
        meta: {
          total: totalCount,
          page,
          perPage: 10
        }
      }
    }
  )
}