import { appRouter } from '@/utils/server/routers/v1/_app'
import { captureException } from '@sentry/nextjs'
import { createOpenApiNextHandler } from 'trpc-openapi'

export default createOpenApiNextHandler({
  router: appRouter,
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      captureException(error)
      console.error('Something went wrong', error)
    }
  },
})
