import prisma from '@typebot.io/lib/prisma'
import { inferAsyncReturnType } from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { User } from '@typebot.io/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { mockedUser } from '@typebot.io/lib/mockedUser'
import { env } from '@typebot.io/env'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/pages/api/auth/[...nextauth]'

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const user = await getAuthenticatedUser(opts.req, opts.res)

  return {
    user,
    origin: opts.req.headers.origin,
    res: opts.res,
  }
}

const getAuthenticatedUser = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | undefined> => {
  if (env.NEXT_PUBLIC_E2E_TEST) return mockedUser
  const bearerToken = extractBearerToken(req)
  if (bearerToken) return authenticateByToken(bearerToken)

  // use session if available
  const user = (await getServerSession(req, res, getAuthOptions({})))?.user as
    | User
    | undefined
  return user
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
