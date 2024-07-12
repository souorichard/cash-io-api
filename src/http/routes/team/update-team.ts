import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { ClientError } from '../../errors/client-error'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function updateTeam(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/team/:teamId',
    {
      schema: {
        params: z.object({
          teamId: z.string().cuid()
        }),
        body: z.object({
          name: z.string().min(3),
          description: z.string().optional()
        })
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request) => {
      const { teamId } = request.params
      const { name, description } = request.body

      const team = await db.team.findUnique({
        where: {
          id: teamId
        }
      })

      if (!team) {
        throw new ClientError('Team not found.')
      }

      await db.team.update({
        where: {
          id: teamId
        },
        data: {
          name,
          description
        }
      })

      return 'Team successfully updated.'
    }
  )
}