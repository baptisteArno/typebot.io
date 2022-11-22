import { createContext } from '@/utils/server/context'
import { appRouter } from '@/utils/server/routers/v1/_app'
import { captureException } from '@sentry/nextjs'
import { createNextApiHandler } from '@trpc/server/adapters/next'

export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      captureException(error)
      console.error('Something went wrong', error)
    }
  },
})
