import { authenticatedProcedure } from '@/helpers/server/trpc'
import {
  startPreviewChatInputSchema,
  startPreviewChatResponseSchema,
} from '@typebot.io/schemas/features/chat/schema'
import { startSession } from '@typebot.io/bot-engine/startSession'
import { saveStateToDatabase } from '@typebot.io/bot-engine/saveStateToDatabase'
import { restartSession } from '@typebot.io/bot-engine/queries/restartSession'

export const startChatPreview = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{typebotId}/preview/startChat',
      summary: 'Start preview chat',
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
          userId: user.id,
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
