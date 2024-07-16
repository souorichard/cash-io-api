import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { decodeToken } from '../../../utils/decode-token'
import { ClientError } from '../../errors/client-error'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function deleteMember(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
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
      const { id } = request.user

      const verifyMember = await db.member.findUnique({
        where: {
          id
        }
      })

      if (!verifyMember?.is_owner) {
        throw new ClientError('Only owners can delete other members.')
      }

      const member = await db.member.findUnique({
        where: {
          id: memberId
        }
      })

      if (!member) {
        throw new ClientError('Member not found.')
      }

      await db.member.delete({
        where: {
          id: member.id
        }
      })

      return 'Member successfully deleted.' 
    }
  )
}