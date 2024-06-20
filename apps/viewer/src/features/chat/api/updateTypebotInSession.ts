import { publicProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { updateSniperInSession as updateSniperInSessionFn } from '@sniper.io/bot-engine/apiHandlers/updateSniperInSession'

export const updateSniperInSession = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/sessions/{sessionId}/updateSniper',
      summary: 'Update sniper in session',
      description:
        'Update chat session with latest sniper modifications. This is useful when you want to update the sniper in an ongoing session after making changes to it.',
      protect: true,
    },
  })
  .input(
    z.object({
      sessionId: z.string(),
    })
  )
  .output(z.object({ message: z.literal('success') }))
  .mutation(({ input: { sessionId }, ctx: { user } }) =>
    updateSniperInSessionFn({ user, sessionId })
  )
