import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { isAuthenticated } from '../../authentication'
import { db } from '../../../lib/db'
import { ClientError } from '../../errors/client-error'
import bcrypt from 'bcrypt';
import { getMailClient } from '../../../lib/mail'
import nodemailer from 'nodemailer';

export async function inviteTeam(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/team/:teamId/invites',
    {
      schema: {
        params: z.object({
          teamId: z.string().cuid()
        }),
        body: z.object({
          email: z.string().email()
        })
      },
      preHandler: (request, reply, done) => {
        isAuthenticated({ request, reply, done })
      }
    },
    async (request) => {
      const { teamId } = request.params
      const { email } = request.body

      const team = await db.team.findUnique({
        where: {
          id: teamId
        },
        include: {
          members: {
            where: {
              is_owner: true
            }
          }
        }
      })

      if (!team) {
        throw new ClientError('Team not found.')
      }

      const existMember = await db.member.findUnique({
        where: {
          email
        }
      })

      if (existMember) {
        throw new ClientError('Email already in use.')
      }

      const randomPassword = Math.random().toString(10).slice(-8)

      const hashAleatoryPassword = bcrypt.hashSync(randomPassword, 10)

      const member = await db.member.create({
        data: {
          email,
          password: hashAleatoryPassword,
          team_id: teamId
        }
      })

      const mail = await getMailClient()

      const owner = team.members.map((owner) => {
        const name = owner.name?.split(' ')[0]

        return name
      })

      const confirmLink = `${process.env.API_BASE_URL}/members/${member.id}/confirm`

      const message = await mail.sendMail({
        from: {
          name: 'Equipe Cash.io',
          address: 'no-reply@cash-io.com',
        },
        to: email,
        subject: `Voce foi convidado para o entrar no time do ${owner}`,
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; line-height: 1.6">
            <div style="max-width: 460px; margin: 0 auto; padding: 20px">
              <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px">Bem-vindo ao Cash.io!</h1>
              <p style="color: rgb(113 113 122); font-size: 16px; margin-bottom: 24px">
                Você foi convidado(a) para participar de um time. Para confirmar sua participação, clique no link abaixo: 
              </p>
              <p style="font-size: 16px; margin-bottom: 24px">
                <span style="font-weight: 600">Senha:</span> ${randomPassword}
              </p>
              <a
                href="${confirmLink}"
                style="
                  display: inline-flex;
                  justify-content: center;
                  align-items: center;
                  background-color: rgb(9 9 11);
                  color: rgb(250 250 250);
                  text-decoration: none;
                  width: 100%;
                  height: 36px;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: 600;
                  transition: background-color 0.3s ease;
                  margin-bottom: 12px;
                "
              >
                Acessar plataforma
              </a>
              <p style="font-size: 12px; color: rgb(113 113 122)">Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
            </div>
          </div>
        `.trim()
      })

      console.log(nodemailer.getTestMessageUrl(message))

      return {
        memberId: member.id,
        linkTest: nodemailer.getTestMessageUrl(message)
      }
    }
  )
}