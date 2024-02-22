import { publicProcedure } from '@/helpers/server/trpc'
import {
  startChatInputSchema,
  startChatResponseSchema,
} from '@typebot.io/schemas/features/chat/schema'
import { startSession } from '@typebot.io/bot-engine/startSession'
import { saveStateToDatabase } from '@typebot.io/bot-engine/saveStateToDatabase'
import { restartSession } from '@typebot.io/bot-engine/queries/restartSession'
import { filterPotentiallySensitiveLogs } from '@typebot.io/bot-engine/logs/filterPotentiallySensitiveLogs'

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
      ctx: { origin, res },
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

      if (
        newSessionState.allowedOrigins &&
        newSessionState.allowedOrigins.length > 0
      ) {
        if (origin && newSessionState.allowedOrigins.includes(origin))
          res.setHeader('Access-Control-Allow-Origin', origin)
        else
          res.setHeader(
            'Access-Control-Allow-Origin',
            newSessionState.allowedOrigins[0]
          )
      }

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
            hasCustomEmbedBubble: messages.some(
              (message) => message.type === 'custom-embed'
            ),
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
        logs: logs?.filter(filterPotentiallySensitiveLogs),
        clientSideActions,
      }
    }
  )
