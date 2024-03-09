import { publicProcedure } from '@/helpers/server/trpc'
import {
  startChatInputSchema,
  startChatResponseSchema,
} from '@typebot.io/schemas/features/chat/schema'
import { startSession } from '@typebot.io/bot-engine/startSession'
import { saveStateToDatabase } from '@typebot.io/bot-engine/saveStateToDatabase'
import { restartSession } from '@typebot.io/bot-engine/queries/restartSession'
import { filterPotentiallySensitiveLogs } from '@typebot.io/bot-engine/logs/filterPotentiallySensitiveLogs'
import { computeCurrentProgress } from '@typebot.io/bot-engine/computeCurrentProgress'

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
        password,
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

      if (typebot.settings.security?.password) {
        if (!password)
          res.status(423).send('This chatform is protected by a password')

        if (password !== typebot.settings.security.password) {
          res.status(401).send('The password provided is incorrect')
        }
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

      const isEnded =
        newSessionState.progressMetadata &&
        !input?.id &&
        (clientSideActions?.filter((c) => c.expectsDedicatedReply).length ??
          0) === 0

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
        progress: newSessionState.progressMetadata
          ? isEnded
            ? 100
            : computeCurrentProgress({
                typebotsQueue: newSessionState.typebotsQueue,
                progressMetadata: newSessionState.progressMetadata,
                currentInputBlockId: input?.id as string,
              })
          : undefined,
      }
    }
  )
