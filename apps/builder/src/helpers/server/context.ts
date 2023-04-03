import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { inferAsyncReturnType } from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const user = await getAuthenticatedUser(opts.req, opts.res)

  return {
    user,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
