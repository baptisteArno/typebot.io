import prisma from '@/lib/prisma'
import { setUser } from '@sentry/nextjs'
import { User } from '@typebot.io/prisma'
import { NextApiRequest } from 'next'
import { getSession } from 'next-auth/react'

export const getAuthenticatedUser = async (
  req: NextApiRequest
): Promise<User | undefined> => {
  const bearerToken = extractBearerToken(req)
  if (bearerToken) return authenticateByToken(bearerToken)
  const session = await getSession({ req })
  if (!session?.user || !('id' in session.user)) return
  const user = session.user as User
  setUser({ id: user.id, email: user.email ?? undefined })
  return session?.user as User
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
