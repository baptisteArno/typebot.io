import { TRPCError, initTRPC } from '@trpc/server'
import { Context } from './context'
import { OpenApiMeta } from 'trpc-openapi'
import superjson from 'superjson'

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  transformer: superjson,
})

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

export const middleware = t.middleware

export const router = t.router

export const publicProcedure = t.procedure

export const authenticatedProcedure = t.procedure.use(isAuthed)
