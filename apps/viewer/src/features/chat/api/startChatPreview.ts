import {
  startPreviewChatInputSchema,
  startPreviewChatResponseSchema,
} from '@sniper.io/schemas/features/chat/schema'
import { publicProcedure } from '@/helpers/server/trpc'
import { startChatPreview as startChatPreviewFn } from '@sniper.io/bot-engine/apiHandlers/startChatPreview'

export const startChatPreview = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/snipers/{sniperId}/preview/startChat',
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
        sniperId,
        sniper: startSniper,
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
        sniperId,
        sniper: startSniper,
        userId: user?.id,
        prefilledVariables,
        sessionId,
        textBubbleContentFormat,
      })
  )
