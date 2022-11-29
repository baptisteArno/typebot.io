import prisma from '@/lib/prisma'
import { publicProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  chatReplySchema,
  ChatSession,
  PublicTypebotWithName,
  Result,
  SessionState,
  typebotSchema,
} from 'models'
import { z } from 'zod'
import { continueBotFlow, getSession, startBotFlow } from '../utils'

export const sendMessageProcedure = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/typebots/{typebotId}/sendMessage',
      summary: 'Send a message',
      description:
        "To initiate a chat, don't provide a `sessionId` and enter any `message`.\n\nContinue the conversation by providing the `sessionId` and the `message` that should answer the previous question.\n\nSet the `isPreview` option to `true` to chat with the non-published version of the typebot.",
    },
  })
  .input(
    z.object({
      typebotId: z.string({
        description:
          '[How can I find my typebot ID?](https://docs.typebot.io/api#how-to-find-my-typebotid)',
      }),
      message: z.string().describe('The answer to the previous question'),
      sessionId: z
        .string()
        .optional()
        .describe(
          'Session ID that you get from the initial chat request to a bot'
        ),
      isPreview: z.boolean().optional(),
    })
  )
  .output(
    chatReplySchema.and(
      z.object({
        sessionId: z.string().nullish(),
        typebot: typebotSchema.pick({ theme: true, settings: true }).nullish(),
      })
    )
  )
  .query(async ({ input: { typebotId, sessionId, message } }) => {
    const session = sessionId ? await getSession(sessionId) : null

    if (!session) {
      const { sessionId, typebot, messages, input } = await startSession(
        typebotId
      )
      return {
        sessionId,
        typebot: typebot
          ? {
              theme: typebot.theme,
              settings: typebot.settings,
            }
          : null,
        messages,
        input,
      }
    } else {
      const { messages, input, logic, newSessionState } = await continueBotFlow(
        session.state
      )(message)

      await prisma.chatSession.updateMany({
        where: { id: session.id },
        data: {
          state: newSessionState,
        },
      })

      return {
        messages,
        input,
        logic,
      }
    }
  })

const startSession = async (typebotId: string) => {
  const typebot = await prisma.typebot.findUnique({
    where: { id: typebotId },
    select: {
      publishedTypebot: true,
      name: true,
      isClosed: true,
      isArchived: true,
      id: true,
    },
  })

  if (!typebot?.publishedTypebot || typebot.isArchived)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Typebot not found',
    })

  if (typebot.isClosed)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Typebot is closed',
    })

  const result = (await prisma.result.create({
    data: { isCompleted: false, typebotId },
    select: {
      id: true,
      variables: true,
      hasStarted: true,
    },
  })) as Pick<Result, 'id' | 'variables' | 'hasStarted'>

  const publicTypebot = typebot.publishedTypebot as PublicTypebotWithName

  const initialState: SessionState = {
    typebot: {
      id: publicTypebot.typebotId,
      groups: publicTypebot.groups,
      edges: publicTypebot.edges,
      variables: publicTypebot.variables,
    },
    linkedTypebots: {
      typebots: [],
      queue: [],
    },
    result: { id: result.id, variables: [], hasStarted: false },
    isPreview: false,
    currentTypebotId: publicTypebot.typebotId,
  }

  const {
    messages,
    input,
    logic,
    newSessionState: newInitialState,
  } = await startBotFlow(initialState)

  if (!input)
    return {
      messages,
      typebot: null,
      sessionId: null,
      logic,
    }

  const sessionState: ChatSession['state'] = {
    ...(newInitialState ?? initialState),
    currentBlock: {
      groupId: input.groupId,
      blockId: input.id,
    },
  }

  const session = (await prisma.chatSession.create({
    data: {
      state: sessionState,
    },
  })) as ChatSession

  return {
    sessionId: session.id,
    typebot: {
      theme: publicTypebot.theme,
      settings: publicTypebot.settings,
    },
    messages,
    input,
    logic,
  }
}
