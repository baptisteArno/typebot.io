import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import type { AppRouter } from '../utils/server/routers/_app'
import superjson from 'superjson'

const getBaseUrl = () =>
  typeof window !== 'undefined' ? '' : process.env.NEXTAUTH_URL

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer: superjson,
    }
  },
  ssr: true,
})
