import { checkChatsUsage } from '@/features/usage'
import {
  parsePrefilledVariables,
  deepParseVariable,
  parseVariables,
} from '@/features/variables'
import prisma from '@/lib/prisma'
import { publicProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from 'db'
import {
  ChatReply,
  chatReplySchema,
  ChatSession,
  Result,
  sendMessageInputSchema,
  SessionState,
  StartParams,
  StartTypebot,
  Theme,
  Typebot,
  Variable,
} from 'models'
import {
  continueBotFlow,
  getSession,
  setResultAsCompleted,
  startBotFlow,
} from '../utils'
import { omit } from 'utils'

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
      const {
        sessionId,
        typebot,
        messages,
        input,
        resultId,
        dynamicTheme,
        logs,
        clientSideActions,
      } = await startSession(startParams)
      return {
        sessionId,
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
      const { messages, input, clientSideActions, newSessionState, logs } =
        await continueBotFlow(session.state)(message)

      await prisma.chatSession.updateMany({
        where: { id: session.id },
        data: {
          state: newSessionState,
        },
      })

      if (!input && session.state.result?.hasStarted)
        await setResultAsCompleted(session.state.result.id)

      return {
        messages,
        input,
        clientSideActions,
        dynamicTheme: parseDynamicThemeReply(newSessionState),
        logs,
      }
    }
  })

const startSession = async (startParams?: StartParams) => {
  if (!startParams?.typebot)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No typebot provided in startParams',
    })

  const isPreview =
    startParams?.isPreview || typeof startParams?.typebot !== 'string'

  const typebot = await getTypebot(startParams)

  const startVariables = startParams.prefilledVariables
    ? parsePrefilledVariables(typebot.variables, startParams.prefilledVariables)
    : typebot.variables

  const result = await getResult({
    ...startParams,
    isPreview,
    typebot: typebot.id,
    startVariables,
    isNewResultOnRefreshEnabled:
      typebot.settings.general.isNewResultOnRefreshEnabled ?? false,
  })

  const initialState: SessionState = {
    typebot: {
      id: typebot.id,
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
    isPreview,
    currentTypebotId: typebot.id,
    dynamicTheme: parseDynamicThemeInState(typebot.theme),
  }

  const {
    messages,
    input,
    clientSideActions,
    newSessionState: newInitialState,
    logs,
  } = await startBotFlow(initialState, startParams.startGroupId)

  if (!input)
    return {
      messages,
      clientSideActions,
      typebot: {
        id: typebot.id,
        settings: deepParseVariable(newInitialState.typebot.variables)(
          typebot.settings
        ),
        theme: deepParseVariable(newInitialState.typebot.variables)(
          typebot.theme
        ),
      },
      dynamicTheme: parseDynamicThemeReply(newInitialState),
      logs,
    }

  const sessionState: ChatSession['state'] = {
    ...newInitialState,
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
      id: typebot.id,
      settings: deepParseVariable(newInitialState.typebot.variables)(
        typebot.settings
      ),
      theme: deepParseVariable(newInitialState.typebot.variables)(
        typebot.theme
      ),
    },
    messages,
    input,
    clientSideActions,
    dynamicTheme: parseDynamicThemeReply(newInitialState),
    logs,
  } satisfies ChatReply
}

const getTypebot = async ({
  typebot,
  isPreview,
}: Pick<StartParams, 'typebot' | 'isPreview'>): Promise<StartTypebot> => {
  if (typeof typebot !== 'string') return typebot
  const typebotQuery = isPreview
    ? await prisma.typebot.findUnique({
        where: { id: typebot },
        select: {
          id: true,
          groups: true,
          edges: true,
          settings: true,
          theme: true,
          variables: true,
          isArchived: true,
        },
      })
    : await prisma.publicTypebot.findFirst({
        where: { typebot: { publicId: typebot } },
        select: {
          groups: true,
          edges: true,
          settings: true,
          theme: true,
          variables: true,
          typebotId: true,
          typebot: {
            select: {
              isArchived: true,
              isClosed: true,
              workspace: {
                select: {
                  id: true,
                  plan: true,
                  additionalChatsIndex: true,
                  chatsLimitFirstEmailSentAt: true,
                  chatsLimitSecondEmailSentAt: true,
                  customChatsLimit: true,
                },
              },
            },
          },
        },
      })

  const parsedTypebot =
    typebotQuery && 'typebot' in typebotQuery
      ? ({
          id: typebotQuery.typebotId,
          ...omit(typebotQuery.typebot, 'workspace'),
          ...omit(typebotQuery, 'typebot', 'typebotId'),
        } as StartTypebot & Pick<Typebot, 'isArchived' | 'isClosed'>)
      : (typebotQuery as StartTypebot & Pick<Typebot, 'isArchived'>)

  if (
    !parsedTypebot ||
    ('isArchived' in parsedTypebot && parsedTypebot.isArchived)
  )
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Typebot not found',
    })

  if ('isClosed' in parsedTypebot && parsedTypebot.isClosed)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Typebot is closed',
    })

  const hasReachedLimit =
    typebotQuery && 'typebot' in typebotQuery
      ? await checkChatsUsage({
          typebotId: parsedTypebot.id,
          workspace: typebotQuery.typebot.workspace,
        })
      : false

  if (hasReachedLimit)
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You have reached your chats limit',
    })

  return parsedTypebot
}

const getResult = async ({
  typebot,
  isPreview,
  resultId,
  startVariables,
  isNewResultOnRefreshEnabled,
}: Pick<StartParams, 'isPreview' | 'resultId' | 'typebot'> & {
  startVariables: Variable[]
  isNewResultOnRefreshEnabled: boolean
}) => {
  if (isPreview || typeof typebot !== 'string') return undefined
  const data = {
    isCompleted: false,
    typebotId: typebot,
    variables: startVariables.filter((variable) => variable.value),
  } satisfies Prisma.ResultUncheckedCreateInput
  const select = {
    id: true,
    variables: true,
    hasStarted: true,
  } satisfies Prisma.ResultSelect
  return (
    resultId && !isNewResultOnRefreshEnabled
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

const parseDynamicThemeInState = (theme: Theme) => {
  const hostAvatarUrl =
    theme.chat.hostAvatar?.isEnabled ?? true
      ? theme.chat.hostAvatar?.url
      : undefined
  const guestAvatarUrl =
    theme.chat.guestAvatar?.isEnabled ?? false
      ? theme.chat.guestAvatar?.url
      : undefined
  if (!hostAvatarUrl?.startsWith('{{') && !guestAvatarUrl?.startsWith('{{'))
    return
  return {
    hostAvatarUrl: hostAvatarUrl?.startsWith('{{') ? hostAvatarUrl : undefined,
    guestAvatarUrl: guestAvatarUrl?.startsWith('{{')
      ? guestAvatarUrl
      : undefined,
  }
}

const parseDynamicThemeReply = (
  state: SessionState | undefined
): ChatReply['dynamicTheme'] => {
  if (!state?.dynamicTheme) return
  return {
    hostAvatarUrl: parseVariables(state?.typebot.variables)(
      state.dynamicTheme.hostAvatarUrl
    ),
    guestAvatarUrl: parseVariables(state?.typebot.variables)(
      state.dynamicTheme.guestAvatarUrl
    ),
  }
}
