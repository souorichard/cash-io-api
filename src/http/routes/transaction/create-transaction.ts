import { FastifyInstance } from 'fastify'
import { isAuthenticated, verifyToken } from '../../authentication'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { decodeToken } from '../../../utils/decode-token'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../../errors/client-error'

export async function createTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/team/:teamId/transactions',
    {
      schema: {
        params: z.object({
          teamId: z.string().cuid()
        }),
        body: z.object({
          description: z.string(),
          category: z.string(),
          amount: z.number(),
          type: z.enum(['EXPENSE', 'REVENUE'])
        })
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request, reply) => {
      const { teamId } = request.params
      const { description, category, amount, type } = request.body

      const { id } = await decodeToken(request, reply)

      const team = await db.team.findUnique({
        where: {
          id: teamId
        }
      })

      if (!team) throw new ClientError('Team not found.')

      // const amountInReal = Math.round(amount * 100)
      
      const transaction = await db.transaction.create({
        data: {
          description,
          category,
          amount_in_cents: amount,
          type,
          created_by_id: id,
          team_id: team.id
        }
      })

      return { transactionId: transaction.id }
    }
  )
}
