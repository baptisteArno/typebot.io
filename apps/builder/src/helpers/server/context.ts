import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { inferAsyncReturnType } from '@trpc/server'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'

function isNextContext(
  opts: CreateNextContextOptions | CreateWSSContextFnOptions
): opts is CreateNextContextOptions {
  return !!opts.res && 'query' in opts.req
}

export async function createContext(
  opts: CreateNextContextOptions | CreateWSSContextFnOptions
) {
  if (isNextContext(opts)) {
    const user = await getAuthenticatedUser(opts.req, opts.res)
    return { user }
  }

  return {
    user: undefined,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
