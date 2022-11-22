import prisma from '@/lib/prisma'
import { setUser } from '@sentry/nextjs'
import { User } from 'db'
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
  console.log(window)
  if (typeof window !== 'undefined') return
  return (await prisma.user.findFirst({
    where: { apiTokens: { some: { token: apiToken } } },
  })) as User
}

const extractBearerToken = (req: NextApiRequest) =>
  req.headers['authorization']?.slice(7)
