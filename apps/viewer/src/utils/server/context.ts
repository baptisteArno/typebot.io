import prisma from '@/lib/prisma'
import { inferAsyncReturnType } from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { User } from '@typebot.io/prisma'
import { NextApiRequest } from 'next'

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const user = await getAuthenticatedUser(opts.req)

  return {
    user,
  }
}

const getAuthenticatedUser = async (
  req: NextApiRequest
): Promise<User | undefined> => {
  const bearerToken = extractBearerToken(req)
  if (!bearerToken) return
  return authenticateByToken(bearerToken)
}

const authenticateByToken = async (
  apiToken: string
): Promise<User | undefined> => {
  if (typeof window !== 'undefined') return
  return (await prisma.user.findFirst({
    where: { apiTokens: { some: { token: apiToken } } },
  })) as User
}

const extractBearerToken = (req: NextApiRequest) =>
  req.headers['authorization']?.slice(7)

export type Context = inferAsyncReturnType<typeof createContext>
