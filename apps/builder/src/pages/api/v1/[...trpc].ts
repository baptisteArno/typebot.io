import { createContext } from '@/utils/server/context'
import { appRouter } from '@/utils/server/routers/v1/_app'
import { createOpenApiNextHandler } from 'trpc-openapi'

export default createOpenApiNextHandler({
  router: appRouter,
  createContext,
})
