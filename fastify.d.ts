import 'fastify'

interface User {
  id: string
  name: string | null
  email: string
  password: string
  is_owner: boolean
  is_confirmed: boolean
  team_id: string
  created_at: Date
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User
  }
}