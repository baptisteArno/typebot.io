import { User } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest } from 'next'

export const authenticateUser = async (
  req: NextApiRequest
): Promise<User | undefined> => authenticateByToken(extractBearerToken(req))

const authenticateByToken = async (
  apiToken?: string
): Promise<User | undefined> => {
  if (!apiToken) return
  return (await prisma.user.findFirst({ where: { apiToken } })) as User
}

const extractBearerToken = (req: NextApiRequest) =>
  req.headers['authorization']?.slice(7)
