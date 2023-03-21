import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import type { AppRouter } from '../helpers/server/routers/v1/trpcRouter'
import superjson from 'superjson'
import { env } from '@typebot.io/lib'

const getBaseUrl = () =>
  typeof window !== 'undefined' ? '' : process.env.NEXTAUTH_URL

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer: superjson,
    }
  },
  ssr: false,
})

export const defaultQueryOptions = {
  refetchOnMount: env('E2E_TEST') === 'true',
}
