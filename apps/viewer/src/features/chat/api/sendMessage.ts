import { publicProcedure } from '@/helpers/server/trpc'
import { saveStateToDatabase } from '../helpers/saveStateToDatabase'
import { getSession } from '../queries/getSession'
import { continueBotFlow } from '../helpers/continueBotFlow'
import { parseDynamicTheme } from '../helpers/parseDynamicTheme'
import { startSession } from '../helpers/startSession'
import { restartSession } from '../queries/restartSession'
import {
  chatReplySchema,
  sendMessageInputSchema,
} from '@typebot.io/schemas/features/chat/schema'
import { TRPCError } from '@trpc/server'

export const sendMessage = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/sendMessage',
      summary: 'Send a message',
      description:
        'To initiate a chat, do not provide a `sessionId` nor a `message`.\n\nContinue the conversation by providing the `sessionId` and the `message` that should answer the previous question.\n\nSet the `isPreview` option to `true` to chat with the non-published version of the typebot.',
    },
  })
  .input(sendMessageInputSchema)
  .output(chatReplySchema)
  .mutation(
    async ({
      input: { sessionId, message, startParams, clientLogs },
      ctx: { user },
    }) => {
      const session = sessionId ? await getSession(sessionId) : null

      if (!session) {
        if (!startParams)
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Missing startParams',
          })
        const {
          typebot,
          messages,
          input,
          resultId,
          dynamicTheme,
          logs,
          clientSideActions,
          newSessionState,
        } = await startSession({ startParams, userId: user?.id })

        const allLogs = clientLogs ? [...(logs ?? []), ...clientLogs] : logs

        const session = startParams?.isOnlyRegistering
          ? await restartSession({
              state: newSessionState,
            })
          : await saveStateToDatabase({
              isFirstSave: true,
              session: {
                state: newSessionState,
              },
              input,
              logs: allLogs,
              clientSideActions,
            })

        return {
          sessionId: session.id,
          typebot: typebot
            ? {
                id: typebot.id,
                theme: typebot.theme,
                settings: typebot.settings,
              }
            : undefined,
          messages,
          input,
          resultId,
          dynamicTheme,
          logs,
          clientSideActions,
        }
      } else {
        const {
          messages,
          input,
          clientSideActions,
          newSessionState,
          logs,
          lastMessageNewFormat,
        } = await continueBotFlow(session.state)(message)

        const allLogs = clientLogs ? [...(logs ?? []), ...clientLogs] : logs

        if (newSessionState)
          await saveStateToDatabase({
            session: {
              id: session.id,
              state: newSessionState,
            },
            input,
            logs: allLogs,
            clientSideActions,
          })

        return {
          messages,
          input,
          clientSideActions,
          dynamicTheme: parseDynamicTheme(newSessionState),
          logs,
          lastMessageNewFormat,
        }
      }
    }
  )
