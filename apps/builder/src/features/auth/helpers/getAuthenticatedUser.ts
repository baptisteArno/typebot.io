import prisma from '@/lib/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { setUser } from '@sentry/nextjs'
import { User } from '@typebot.io/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { mockedUser } from '../mockedUser'
import { env } from '@typebot.io/lib'

export const getAuthenticatedUser = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | undefined> => {
  const bearerToken = extractBearerToken(req)
  if (bearerToken) return authenticateByToken(bearerToken)
  const user =
    env('E2E_TEST') === 'true'
      ? mockedUser
      : ((await getServerSession(req, res, authOptions))?.user as
          | User
          | undefined)
  if (!user || !('id' in user)) return
  setUser({ id: user.id, email: user.email ?? undefined })
  return user
}

const authenticateByToken = async (
  apiToken: string
): Promise<User | undefined> => {
  if (typeof window !== 'undefined') return
  const user = (await prisma.user.findFirst({
    where: { apiTokens: { some: { token: apiToken } } },
  })) as User
  setUser({ id: user.id, email: user.email ?? undefined })
  return user
}

const extractBearerToken = (req: NextApiRequest) =>
  req.headers['authorization']?.slice(7)
