import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { ClientError } from '../../errors/client-error'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getMembers(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/team/:teamId/members',
    {
      schema: {
        params: z.object({
          teamId: z.string().cuid()
        }),
        querystring: z.object({
          page: z.coerce.number()
        })
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request) => {
      const { teamId } = request.params
      const { page } = request.query

      const team = await db.team.findUnique({
        where: {
          id: teamId
        }
      })

      if (!team) {
        throw new ClientError('Team not found.')
      }

      const members = await db.member.findMany({
        where: {
          team_id: teamId,
          is_confirmed: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          is_owner: true
        },
        skip: page * 3,
        take: 3
      })

      const totalCount = await db.member.count({
        where: {
          team_id: teamId,
          is_confirmed: true
        }
      })

      return {
        members,
        meta: {
          total: totalCount,
          page,
          perPage: 3
        }
      }
    }
  )
}