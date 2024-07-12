import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { ClientError } from '../../errors/client-error'
import bcrypt from 'bcrypt'

export async function signUp(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sign-up',
    {
      schema: {
        body: z.object({
          name: z.string().min(3),
          email: z.string().email(),
          password: z.string().min(8),
        })
      }
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const memberExist = await db.member.findUnique({
        where: {
          email
        }
      })

      if (memberExist) throw new ClientError('Email already in use.')

      const hashPassword = bcrypt.hashSync(password, 10)

      await db.team.create({
        data: {
          name: `Equipe do ${name.split(' ')[0]}`,
          members: {
            create: {
              name,
              email,
              password: hashPassword,
              is_owner: true
            }
          }
        }
      })

      return reply.status(201).send('User registered successfully.')
    }
  )
}