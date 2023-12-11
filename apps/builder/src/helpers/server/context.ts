import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { inferAsyncReturnType } from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { getIp } from '@typebot.io/lib/getIp'

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const user = await getAuthenticatedUser(opts.req, opts.res)
  const ip = getIp(opts.req)

  return {
    user,
    ip,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
