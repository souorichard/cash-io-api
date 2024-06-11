import { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "../http/authentication";

export async function decodeToken(request: FastifyRequest, reply: FastifyReply) {
  const userToken = request.headers.authorization?.replace('Bearer ', '')

  const user = await verifyToken(userToken!)

  if (!user) {
    return reply.status(404).send({ message: 'Unauthorized! Invalid token' })
  }

  return user
}