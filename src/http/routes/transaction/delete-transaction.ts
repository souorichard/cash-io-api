import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../../errors/client-error'

export async function deleteTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/team/:teamId/transactions/:transactionId',
    {
      schema: {
        params: z.object({
          teamId: z.string().cuid(),
          transactionId: z.string().cuid()
        }),
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request) => {
      const { teamId, transactionId } = request.params

      const team = await db.team.findUnique({
        where: {
          id: teamId
        }
      })

      if (!team) throw new ClientError('Team not found.')

      const transaction = await db.transaction.findUnique({
        where: {
          id: transactionId
        }
      })

      if (!transaction) throw new ClientError('Transaction not found.')
      
      await db.transaction.delete({
        where: {
          team_id: teamId,
          id: transactionId
        }
      })

      return 'Transaction successfully deleted.'
    }
  )
}