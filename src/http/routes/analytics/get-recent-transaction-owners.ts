import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../../errors/client-error'

export async function getRecentTransactionOwners(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/team/:teamId/transactions/recent',
    {
      schema: {
        params: z.object({
          teamId: z.string().cuid()
        }),
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request) => {
      const { teamId } = request.params

      const team = await db.team.findUnique({
        where: {
          id: teamId
        }
      })

      if (!team) throw new ClientError('Team not found.')

      const transactions = await db.transaction.findMany({
        include: {
          created_by: {
            select: {
              name: true,
              email: true
            }
          }
        },
        where: {
          team_id: teamId
        },
        orderBy: {
          created_at: 'desc'
        }
      })

      const recentTransactions = transactions.slice(0, 6)

      return recentTransactions
    }
  )
}