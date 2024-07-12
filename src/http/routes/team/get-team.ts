import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { ClientError } from '../../errors/client-error'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getTeam(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/team/:teamId',
    {
      schema: {
        params: z.object({
          teamId: z.string().cuid()
        })
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

      if (!team) {
        throw new ClientError('Team not found.')
      }

      return team
    }
  )
}