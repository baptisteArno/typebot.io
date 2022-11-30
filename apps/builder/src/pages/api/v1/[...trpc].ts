import { createContext } from '@/utils/server/context'
import { trpcRouter } from '@/utils/server/routers/v1/trpcRouter'
import { captureException } from '@sentry/nextjs'
import { createOpenApiNextHandler } from 'trpc-openapi'

export default createOpenApiNextHandler({
  router: trpcRouter,
  createContext,
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      captureException(error)
      console.error('Something went wrong', error)
    }
  },
})
