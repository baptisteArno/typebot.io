import { createContext } from '@/helpers/server/context'
import { appRouter } from '@/helpers/server/routers/appRouter'
import * as Sentry from '@sentry/nextjs'
import { createNextApiHandler } from '@trpc/server/adapters/next'
import logger from '@/helpers/logger'

export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      Sentry.captureException(error)
      logger.error('Something went wrong', error)
    }
    return error
  },
  batching: {
    enabled: true,
  },
})
