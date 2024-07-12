import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../../lib/db'
import { ClientError } from '../../errors/client-error'

export async function confirmMember(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/members/:memberId/confirm',
    {
      schema: {
        params: z.object({
          memberId: z.string().cuid()
        }),
      }
    },
    async (request, reply) => {
      const { memberId } = request.params

      const member = await db.member.findUnique({
        where: {
          id: memberId
        }
      })

      if (!member) {
        throw new ClientError('Member not found.')
      }

      if (member.is_confirmed) {
        return reply.redirect(`${process.env.WEB_BASE_URL}/team/${member.team_id}`)
      }

      await db.member.update({
        where: {
          id: memberId
        },
        data: {
          is_confirmed: true
        }
      })

      return reply.redirect(`${process.env.WEB_BASE_URL}/team/${member.team_id}`)
    }
  )
}