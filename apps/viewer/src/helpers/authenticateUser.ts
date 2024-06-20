import { User } from '@sniper.io/prisma'
import { NextApiRequest } from 'next'
import prisma from '@sniper.io/lib/prisma'

export const authenticateUser = async (
  req: NextApiRequest
): Promise<User | undefined> => authenticateByToken(extractBearerToken(req))

const authenticateByToken = async (
  apiToken?: string
): Promise<User | undefined> => {
  if (!apiToken) return
  return (await prisma.user.findFirst({
    where: { apiTokens: { some: { token: apiToken } } },
  })) as User
}

const extractBearerToken = (req: NextApiRequest) =>
  req.headers['authorization']?.slice(7)
