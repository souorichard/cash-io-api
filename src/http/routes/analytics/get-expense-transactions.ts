import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../../errors/client-error'
import { expenseTransactions } from '../../../utils/expense-transactions'

export async function getExpenseTransactions(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/team/:teamId/transactions/expense',
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

      const { transactions, diffFromLastMonth } = await expenseTransactions(teamId)

      return {
        transactions,
        diffFromLastMonth
      }
    }
  )
}