import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { ClientError } from '../../errors/client-error'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getMember(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/members/:memberId',
    {
      schema: {
        params: z.object({
          memberId: z.string().cuid()
        })
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request) => {
      const { memberId } = request.params

      const member = await db.member.findUnique({
        where: {
          id: memberId
        }
      })

      if (!member) {
        throw new ClientError('Member not found.')
      }

      return member
    }
  )
}