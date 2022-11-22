import { createContext } from '@/utils/server/context'
import { appRouter } from '@/utils/server/routers/v1/_app'
import { createNextApiHandler } from '@trpc/server/adapters/next'

export default createNextApiHandler({
  router: appRouter,
  createContext,
})
