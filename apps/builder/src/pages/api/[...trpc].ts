import { createContext } from '@/utils/server/context'
import { appRouter } from '@/utils/server/routers/_app'
import { createOpenApiNextHandler } from 'trpc-openapi'

export default createOpenApiNextHandler({
  router: appRouter,
  createContext,
})
