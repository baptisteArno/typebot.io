import {
  startPreviewChatInputSchema,
  startPreviewChatResponseSchema,
} from '@typebot.io/schemas/features/chat/schema'
import { startSession } from '@typebot.io/bot-engine/startSession'
import { saveStateToDatabase } from '@typebot.io/bot-engine/saveStateToDatabase'
import { restartSession } from '@typebot.io/bot-engine/queries/restartSession'
import { publicProcedure } from '@/helpers/server/trpc'

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
      },
      ctx: { user },
    }) => {
      const {
        typebot,
        messages,
        input,
        dynamicTheme,
        logs,
        clientSideActions,
        newSessionState,
        visitedEdges,
      } = await startSession({
        version: 2,
        startParams: {
          type: 'preview',
          isOnlyRegistering,
          isStreamEnabled,
          startFrom,
          typebotId,
          typebot: startTypebot,
          userId: user?.id,
        },
        message,
      })

      const session = isOnlyRegistering
        ? await restartSession({
            state: newSessionState,
          })
        : await saveStateToDatabase({
            session: {
              state: newSessionState,
            },
            input,
            logs,
            clientSideActions,
            visitedEdges,
          })

      return {
        sessionId: session.id,
        typebot: {
          id: typebot.id,
          theme: typebot.theme,
          settings: typebot.settings,
        },
        messages,
        input,
        dynamicTheme,
        logs,
        clientSideActions,
      }
    }
  )
