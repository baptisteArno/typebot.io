import { publicProcedure } from '@/helpers/server/trpc'
import { continueChatResponseSchema } from '@typebot.io/schemas/features/chat/schema'
import { TRPCError } from '@trpc/server'
import { getSession } from '@typebot.io/bot-engine/queries/getSession'
import { saveStateToDatabase } from '@typebot.io/bot-engine/saveStateToDatabase'
import { continueBotFlow } from '@typebot.io/bot-engine/continueBotFlow'
import { parseDynamicTheme } from '@typebot.io/bot-engine/parseDynamicTheme'
import { isDefined } from '@typebot.io/lib/utils'
import { z } from 'zod'

export const continueChat = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/sessions/{sessionId}/continueChat',
      summary: 'Continue chat',
      description:
        'To initiate a chat, do not provide a `sessionId` nor a `message`.\n\nContinue the conversation by providing the `sessionId` and the `message` that should answer the previous question.\n\nSet the `isPreview` option to `true` to chat with the non-published version of the typebot.',
    },
  })
  .input(
    z.object({
      message: z.string().optional(),
      sessionId: z.string(),
    })
  )
  .output(continueChatResponseSchema)
  .mutation(async ({ input: { sessionId, message } }) => {
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

    const {
      messages,
      input,
      clientSideActions,
      newSessionState,
      logs,
      lastMessageNewFormat,
      visitedEdges,
    } = await continueBotFlow(message, { version: 2, state: session.state })

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
      })

    return {
      messages,
      input,
      clientSideActions,
      dynamicTheme: parseDynamicTheme(newSessionState),
      logs,
      lastMessageNewFormat,
    }
  })
