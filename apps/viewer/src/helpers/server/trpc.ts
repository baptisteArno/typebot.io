import { TRPCError, initTRPC } from '@trpc/server'
import { OpenApiMeta } from 'trpc-openapi'
import superjson from 'superjson'
import { Context } from './context'
import * as Sentry from '@sentry/nextjs'

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  transformer: superjson,
})

export const router = t.router

const sentryMiddleware = t.middleware(
  Sentry.Handlers.trpcMiddleware({
    attachRpcInput: true,
  })
)

export const publicProcedure = t.procedure.use(sentryMiddleware)

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You need to be authenticated to perform this action',
    })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

export const authenticatedProcedure = t.procedure.use(
  sentryMiddleware.unstable_pipe(isAuthed)
)
