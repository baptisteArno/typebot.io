import prisma from '@sniper.io/lib/prisma'
import { inferAsyncReturnType } from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { User } from '@sniper.io/prisma'
import { NextApiRequest } from 'next'
import { mockedUser } from '@sniper.io/lib/mockedUser'
import { env } from '@sniper.io/env'

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const user = await getAuthenticatedUser(opts.req)

  return {
    user,
    origin: opts.req.headers.origin,
    res: opts.res,
  }
}

const getAuthenticatedUser = async (
  req: NextApiRequest
): Promise<User | undefined> => {
  if (env.NEXT_PUBLIC_E2E_TEST) return mockedUser
  const bearerToken = extractBearerToken(req)
  if (!bearerToken) return
  return authenticateByToken(bearerToken)
}

const authenticateByToken = async (
  token: string
): Promise<User | undefined> => {
  if (typeof window !== 'undefined') return
  const apiToken = await prisma.apiToken.findFirst({
    where: {
      token,
    },
    select: {
      owner: true,
    },
  })
  return apiToken?.owner
}

const extractBearerToken = (req: NextApiRequest) =>
  req.headers['authorization']?.slice(7)

export type Context = inferAsyncReturnType<typeof createContext>
