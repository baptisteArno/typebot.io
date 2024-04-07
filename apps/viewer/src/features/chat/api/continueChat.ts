import { publicProcedure } from '@/helpers/server/trpc'
import { continueChatResponseSchema } from '@typebot.io/schemas/features/chat/schema'
import { z } from 'zod'
import { continueChat as continueChatFn } from '@typebot.io/bot-engine/apiHandlers/continueChat'

export const continueChat = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/sessions/{sessionId}/continueChat',
      summary: 'Continue chat',
    },
  })
  .input(
    z.object({
      message: z.string().optional(),
      sessionId: z
        .string()
        .describe(
          'The session ID you got from the [startChat](./start-chat) response.'
        ),
    })
  )
  .output(continueChatResponseSchema)
  .mutation(async ({ input: { sessionId, message }, ctx: { origin, res } }) => {
    const { corsOrigin, ...response } = await continueChatFn({
      origin,
      sessionId,
      message,
    })
    if (corsOrigin) res.setHeader('Access-Control-Allow-Origin', corsOrigin)
    return response
  })
