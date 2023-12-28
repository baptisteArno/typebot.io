import { initTRPC } from '@trpc/server'
import { OpenApiMeta } from '@lilyrose2798/trpc-openapi'
import superjson from 'superjson'
import { Context } from './context'
import * as Sentry from '@sentry/nextjs'

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  transformer: superjson,
})

const sentryMiddleware = t.middleware(
  Sentry.Handlers.trpcMiddleware({
    attachRpcInput: true,
  })
)

const injectUser = t.middleware(({ next, ctx }) => {
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

const finalMiddleware = sentryMiddleware.unstable_pipe(injectUser)

export const middleware = t.middleware

export const router = t.router

export const publicProcedure = t.procedure.use(finalMiddleware)
