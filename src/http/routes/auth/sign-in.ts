import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { generateToken } from '../../authentication'
import bcrypt from 'bcrypt'
import { ClientError } from '../../errors/client-error'

export async function signIn(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sign-in',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8)
        })
      }
    },
    async (request) => {
      const { email, password } = request.body

      const existMember = await db.member.findUnique({
        where: {
          email
        },
        include: {
          team: true
        },
      })

      if (!existMember) throw new ClientError('Email not found.')

      if (!bcrypt.compareSync(password, existMember.password)) {
        throw new ClientError('Incorrect password.')
      }

      const { id, email: _email, team } = existMember
      
      const token = generateToken({
        id,
        email: _email
      })

      return {
        memberId: id,
        teamId: team.id,
        token
      }
    }
  )
}