import {
  startPreviewChatInputSchema,
  startPreviewChatResponseSchema,
} from '@typebot.io/schemas/features/chat/schema'
import { publicProcedure } from '@/helpers/server/trpc'
import { startChatPreview as startChatPreviewFn } from '@typebot.io/bot-engine/apiHandlers/startChatPreview'

export const startChatPreview = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{typebotId}/preview/startChat',
      summary: 'Start preview chat',
      description:
        'Use this endpoint to test your bot. The answers will not be saved. And some blocks like "Send email" will be skipped.',
    },
  })
  .input(startPreviewChatInputSchema)
  .output(startPreviewChatResponseSchema)
  .mutation(
    async ({
      input: {
        message,
        isOnlyRegistering,
        isStreamEnabled,
        startFrom,
        typebotId,
        typebot: startTypebot,
        prefilledVariables,
        sessionId,
        textBubbleContentFormat,
      },
      ctx: { user },
    }) =>
      startChatPreviewFn({
        message,
        isOnlyRegistering,
        isStreamEnabled,
        startFrom,
        typebotId,
        typebot: startTypebot,
        userId: user?.id,
        prefilledVariables,
        sessionId,
        textBubbleContentFormat,
      })
  )
