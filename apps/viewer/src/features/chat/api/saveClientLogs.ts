import { publicProcedure } from '@/helpers/server/trpc'
import { chatLogSchema } from '@typebot.io/schemas/features/chat/schema'
import { z } from 'zod'
import { saveClientLogs as saveClientLogsFn } from '@typebot.io/bot-engine/apiHandlers/saveClientLogs'

export const saveClientLogs = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/sessions/{sessionId}/clientLogs',
      summary: 'Save logs',
    },
  })
  .input(
    z.object({
      sessionId: z.string(),
      clientLogs: z.array(chatLogSchema),
    })
  )
  .output(z.object({ message: z.string() }))
  .mutation(({ input: { sessionId, clientLogs } }) =>
    saveClientLogsFn({ sessionId, clientLogs })
  )
