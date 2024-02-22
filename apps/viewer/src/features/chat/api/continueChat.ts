import { publicProcedure } from '@/helpers/server/trpc'
import { continueChatResponseSchema } from '@typebot.io/schemas/features/chat/schema'
import { TRPCError } from '@trpc/server'
import { getSession } from '@typebot.io/bot-engine/queries/getSession'
import { saveStateToDatabase } from '@typebot.io/bot-engine/saveStateToDatabase'
import { continueBotFlow } from '@typebot.io/bot-engine/continueBotFlow'
import { parseDynamicTheme } from '@typebot.io/bot-engine/parseDynamicTheme'
import { isDefined, isNotDefined } from '@typebot.io/lib/utils'
import { z } from 'zod'
import { filterPotentiallySensitiveLogs } from '@typebot.io/bot-engine/logs/filterPotentiallySensitiveLogs'

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
  .mutation(async ({ input: { sessionId, message }, ctx: { res, origin } }) => {
    const session = await getSession(sessionId)

    if (!session) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Session not found.',
      })
    }

    const isSessionExpired =
      session &&
      isDefined(session.state.expiryTimeout) &&
      session.updatedAt.getTime() + session.state.expiryTimeout < Date.now()

    if (isSessionExpired)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Session expired. You need to start a new session.',
      })

    if (
      session?.state.allowedOrigins &&
      session.state.allowedOrigins.length > 0
    ) {
      if (origin && session.state.allowedOrigins.includes(origin))
        res.setHeader('Access-Control-Allow-Origin', origin)
      else
        res.setHeader(
          'Access-Control-Allow-Origin',
          session.state.allowedOrigins[0]
        )
    }

    const {
      messages,
      input,
      clientSideActions,
      newSessionState,
      logs,
      lastMessageNewFormat,
      visitedEdges,
    } = await continueBotFlow(message, {
      version: 2,
      state: session.state,
      startTime: Date.now(),
    })

    if (newSessionState)
      await saveStateToDatabase({
        session: {
          id: session.id,
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

    const isPreview = isNotDefined(session.state.typebotsQueue[0].resultId)

    return {
      messages,
      input,
      clientSideActions,
      dynamicTheme: parseDynamicTheme(newSessionState),
      logs: isPreview ? logs : logs?.filter(filterPotentiallySensitiveLogs),
      lastMessageNewFormat,
    }
  })
