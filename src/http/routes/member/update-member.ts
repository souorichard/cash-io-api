import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { ClientError } from '../../errors/client-error'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function updateMember(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/members/:memberId',
    {
      schema: {
        params: z.object({
          memberId: z.string().cuid()
        }),
        body: z.object({
          name: z.string().min(3),
        })
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request) => {
      const { memberId } = request.params
      const { name } = request.body

      const member = await db.member.findMany({
        where: {
          id: memberId
        }
      })

      if (!member) {
        throw new ClientError('Member not found.')
      }

      await db.member.update({
        where: {
          id: memberId
        },
        data: {
          name
        }
      })

      return 'Member successfully updated.'
    }
  )
}