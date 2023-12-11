import prisma from '@typebot.io/lib/prisma'
import { getAuthOptions } from '@/pages/api/auth/[...nextauth]'
import * as Sentry from '@sentry/nextjs'
import { User } from '@typebot.io/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { env } from '@typebot.io/env'
import { mockedUser } from '@typebot.io/lib/mockedUser'

export const getAuthenticatedUser = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | undefined> => {
  const bearerToken = extractBearerToken(req)
  if (bearerToken) return authenticateByToken(bearerToken)
  const user = env.NEXT_PUBLIC_E2E_TEST
    ? mockedUser
    : ((await getServerSession(req, res, getAuthOptions({})))?.user as
        | User
        | undefined)
  if (!user || !('id' in user)) return
  Sentry.setUser({ id: user.id })
  return user
}

const authenticateByToken = async (
  apiToken: string
): Promise<User | undefined> => {
  if (typeof window !== 'undefined') return
  const user = (await prisma.user.findFirst({
    where: { apiTokens: { some: { token: apiToken } } },
  })) as User
  Sentry.setUser({ id: user.id })
  return user
}

const extractBearerToken = (req: NextApiRequest) =>
  req.headers['authorization']?.slice(7)
