import { publicProcedure } from '@/helpers/server/trpc'
import {
  startChatInputSchema,
  startChatResponseSchema,
} from '@typebot.io/schemas/features/chat/schema'
import { startSession } from '@typebot.io/bot-engine/startSession'
import { saveStateToDatabase } from '@typebot.io/bot-engine/saveStateToDatabase'
import { restartSession } from '@typebot.io/bot-engine/queries/restartSession'

export const startChat = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{publicId}/startChat',
      summary: 'Start chat',
    },
  })
  .input(startChatInputSchema)
  .output(startChatResponseSchema)
  .mutation(
    async ({
      input: {
        message,
        isOnlyRegistering,
        publicId,
        isStreamEnabled,
        prefilledVariables,
        resultId: startResultId,
      },
    }) => {
      const {
        typebot,
        messages,
        input,
        resultId,
        dynamicTheme,
        logs,
        clientSideActions,
        newSessionState,
        visitedEdges,
      } = await startSession({
        version: 2,
        startParams: {
          type: 'live',
          isOnlyRegistering,
          isStreamEnabled,
          publicId,
          prefilledVariables,
          resultId: startResultId,
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
        resultId,
        dynamicTheme,
        logs,
        clientSideActions,
      }
    }
  )
