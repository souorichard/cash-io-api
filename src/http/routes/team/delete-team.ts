import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { ClientError } from '../../errors/client-error'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { decodeToken } from '../../../utils/decode-token'

export async function deleteTeam(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
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
    async (request, reply) => {
      const { teamId } = request.params

      const { id } = await decodeToken(request, reply)

      const member = await db.member.findUnique({
        where: {
          id
        }
      })

      if (!member) {
        throw new ClientError('Only owners can delete team.')
      }

      const team = await db.team.findUnique({
        where: {
          id: teamId
        }
      })

      if (!team) {
        throw new ClientError('Team not found.')
      }

      await db.team.delete({
        where: {
          id: teamId
        }
      })

      return 'Team successfully deleted.'
    }
  )
}