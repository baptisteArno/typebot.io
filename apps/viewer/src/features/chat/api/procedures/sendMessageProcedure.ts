import { checkChatsUsage } from '@/features/usage'
import {
  parsePrefilledVariables,
  deepParseVariable,
} from '@/features/variables'
import prisma from '@/lib/prisma'
import { publicProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from 'db'
import {
  ChatReply,
  chatReplySchema,
  ChatSession,
  PublicTypebot,
  Result,
  sendMessageInputSchema,
  SessionState,
  StartParams,
  Typebot,
  Variable,
} from 'models'
import { continueBotFlow, getSession, startBotFlow } from '../utils'

export const sendMessageProcedure = publicProcedure
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
  .query(async ({ input: { sessionId, message, startParams } }) => {
    const session = sessionId ? await getSession(sessionId) : null

    if (!session) {
      const { sessionId, typebot, messages, input, resultId } =
        await startSession(startParams)
      return {
        sessionId,
        typebot: typebot
          ? {
              theme: typebot.theme,
              settings: typebot.settings,
            }
          : undefined,
        messages,
        input,
        resultId,
      }
    } else {
      const { messages, input, logic, newSessionState, integrations } =
        await continueBotFlow(session.state)(message)

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
        integrations,
      }
    }
  })

const startSession = async (startParams?: StartParams) => {
  if (!startParams?.typebotId)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No typebotId provided in startParams',
    })
  const typebotQuery = startParams.isPreview
    ? await prisma.typebot.findUnique({
        where: { id: startParams.typebotId },
        select: {
          groups: true,
          edges: true,
          settings: true,
          theme: true,
          variables: true,
          isArchived: true,
        },
      })
    : await prisma.typebot.findUnique({
        where: { id: startParams.typebotId },
        select: {
          publishedTypebot: {
            select: {
              groups: true,
              edges: true,
              settings: true,
              theme: true,
              variables: true,
            },
          },
          name: true,
          isClosed: true,
          isArchived: true,
          id: true,
        },
      })

  const typebot =
    typebotQuery && 'publishedTypebot' in typebotQuery
      ? (typebotQuery.publishedTypebot as Pick<
          PublicTypebot,
          'groups' | 'edges' | 'settings' | 'theme' | 'variables'
        >)
      : (typebotQuery as Pick<
          Typebot,
          'groups' | 'edges' | 'settings' | 'theme' | 'variables' | 'isArchived'
        >)

  if (!typebot)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Typebot not found',
    })

  if ('isClosed' in typebot && typebot.isClosed)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Typebot is closed',
    })

  const hasReachedLimit = !startParams.isPreview
    ? await checkChatsUsage(startParams.typebotId)
    : false

  if (hasReachedLimit)
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Your workspace reached its chat limit',
    })

  const startVariables = startParams.prefilledVariables
    ? parsePrefilledVariables(typebot.variables, startParams.prefilledVariables)
    : typebot.variables

  const result = await getResult({ ...startParams, startVariables })

  const initialState: SessionState = {
    typebot: {
      id: startParams.typebotId,
      groups: typebot.groups,
      edges: typebot.edges,
      variables: startVariables,
    },
    linkedTypebots: {
      typebots: [],
      queue: [],
    },
    result: result
      ? { id: result.id, variables: result.variables, hasStarted: false }
      : undefined,
    isPreview: false,
    currentTypebotId: startParams.typebotId,
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
    resultId: result?.id,
    sessionId: session.id,
    typebot: {
      settings: deepParseVariable(typebot.variables)(typebot.settings),
      theme: deepParseVariable(typebot.variables)(typebot.theme),
    },
    messages,
    input,
    logic,
  } satisfies ChatReply
}

const getResult = async ({
  typebotId,
  isPreview,
  resultId,
  startVariables,
}: Pick<StartParams, 'isPreview' | 'resultId' | 'typebotId'> & {
  startVariables: Variable[]
}) => {
  if (isPreview) return undefined
  const data = {
    isCompleted: false,
    typebotId: typebotId,
    variables: { set: startVariables.filter((variable) => variable.value) },
  } satisfies Prisma.ResultUncheckedCreateInput
  const select = {
    id: true,
    variables: true,
    hasStarted: true,
  } satisfies Prisma.ResultSelect
  return (
    resultId
      ? await prisma.result.update({
          where: { id: resultId },
          data,
          select,
        })
      : await prisma.result.create({
          data,
          select,
        })
  ) as Pick<Result, 'id' | 'variables' | 'hasStarted'>
}
