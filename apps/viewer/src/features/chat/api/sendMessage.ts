import prisma from '@/lib/prisma'
import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@typebot.io/prisma'
import {
  ChatReply,
  chatReplySchema,
  ChatSession,
  ResultInSession,
  sendMessageInputSchema,
  SessionState,
  StartParams,
  StartTypebot,
  Theme,
  Typebot,
  Variable,
  VariableWithValue,
} from '@typebot.io/schemas'
import {
  continueBotFlow,
  getSession,
  setResultAsCompleted,
  startBotFlow,
} from '../helpers'
import { env, isDefined, omit } from '@typebot.io/lib'
import { prefillVariables } from '@/features/variables/prefillVariables'
import { injectVariablesFromExistingResult } from '@/features/variables/injectVariablesFromExistingResult'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { parseVariables } from '@/features/variables/parseVariables'

export const sendMessage = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/sendMessage',
      summary: 'Send a message',
      description:
        'To initiate a chat, do not provide a `sessionId` nor a `message`.\n\nContinue the conversation by providing the `sessionId` and the `message` that should answer the previous question.\n\nSet the `isPreview` option to `true` to chat with the non-published version of the typebot.',
      protect: true,
    },
  })
  .input(sendMessageInputSchema)
  .output(chatReplySchema)
  .query(
    async ({ input: { sessionId, message, startParams }, ctx: { user } }) => {
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
        } = await startSession(startParams, user?.id)
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

        const containsSetVariableClientSideAction = clientSideActions?.some(
          (action) => 'setVariable' in action
        )

        if (
          !input &&
          !containsSetVariableClientSideAction &&
          session.state.result.answers.length > 0 &&
          session.state.result.id
        )
          await setResultAsCompleted(session.state.result.id)

        return {
          messages,
          input,
          clientSideActions,
          dynamicTheme: parseDynamicThemeReply(newSessionState),
          logs,
        }
      }
    }
  )

const startSession = async (startParams?: StartParams, userId?: string) => {
  if (!startParams?.typebot)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No typebot provided in startParams',
    })

  const typebot = await getTypebot(startParams, userId)

  const prefilledVariables = startParams.prefilledVariables
    ? prefillVariables(typebot.variables, startParams.prefilledVariables)
    : typebot.variables

  const result = await getResult({
    ...startParams,
    isPreview: startParams.isPreview || typeof startParams.typebot !== 'string',
    typebotId: typebot.id,
    prefilledVariables,
    isNewResultOnRefreshEnabled:
      typebot.settings.general.isNewResultOnRefreshEnabled ?? false,
  })

  const startVariables =
    result && result.variables.length > 0
      ? injectVariablesFromExistingResult(prefilledVariables, result.variables)
      : prefilledVariables

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
    result: {
      id: result?.id,
      variables: result?.variables ?? [],
      answers: result?.answers ?? [],
    },
    currentTypebotId: typebot.id,
    dynamicTheme: parseDynamicThemeInState(typebot.theme),
  }

  const { messages, input, clientSideActions, newSessionState, logs } =
    await startBotFlow(initialState, startParams.startGroupId)

  const containsSetVariableClientSideAction = clientSideActions?.some(
    (action) => 'setVariable' in action
  )

  if (!input && !containsSetVariableClientSideAction)
    return {
      messages,
      clientSideActions,
      typebot: {
        id: typebot.id,
        settings: deepParseVariables(newSessionState.typebot.variables)(
          typebot.settings
        ),
        theme: deepParseVariables(newSessionState.typebot.variables)(
          typebot.theme
        ),
      },
      dynamicTheme: parseDynamicThemeReply(newSessionState),
      logs,
    }

  const session = (await prisma.chatSession.create({
    data: {
      state: newSessionState,
    },
  })) as ChatSession

  return {
    resultId: result?.id,
    sessionId: session.id,
    typebot: {
      id: typebot.id,
      settings: deepParseVariables(newSessionState.typebot.variables)(
        typebot.settings
      ),
      theme: deepParseVariables(newSessionState.typebot.variables)(
        typebot.theme
      ),
    },
    messages,
    input,
    clientSideActions,
    dynamicTheme: parseDynamicThemeReply(newSessionState),
    logs,
  } satisfies ChatReply
}

const getTypebot = async (
  { typebot, isPreview }: Pick<StartParams, 'typebot' | 'isPreview'>,
  userId?: string
): Promise<StartTypebot> => {
  if (typeof typebot !== 'string') return typebot
  if (isPreview && !userId && env('E2E_TEST') !== 'true')
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message:
        'You need to authenticate the request to start a bot in preview mode.',
    })
  const typebotQuery = isPreview
    ? await prisma.typebot.findFirst({
        where: { id: typebot, workspace: { members: { some: { userId } } } },
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
                  customChatsLimit: true,
                  isQuarantined: true,
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

  const isQuarantined =
    typebotQuery &&
    'typebot' in typebotQuery &&
    typebotQuery.typebot.workspace.isQuarantined

  if (('isClosed' in parsedTypebot && parsedTypebot.isClosed) || isQuarantined)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Typebot is closed',
    })

  return parsedTypebot
}

const getResult = async ({
  typebotId,
  isPreview,
  resultId,
  prefilledVariables,
  isNewResultOnRefreshEnabled,
}: Pick<StartParams, 'isPreview' | 'resultId'> & {
  typebotId: string
  prefilledVariables: Variable[]
  isNewResultOnRefreshEnabled: boolean
}) => {
  if (isPreview) return
  const select = {
    id: true,
    variables: true,
    answers: { select: { blockId: true, variableId: true, content: true } },
  } satisfies Prisma.ResultSelect

  const existingResult =
    resultId && !isNewResultOnRefreshEnabled
      ? ((await prisma.result.findFirst({
          where: { id: resultId },
          select,
        })) as ResultInSession)
      : undefined

  if (existingResult) {
    const prefilledVariableWithValue = prefilledVariables.filter(
      (prefilledVariable) => isDefined(prefilledVariable.value)
    )
    const updatedResult = {
      variables: prefilledVariableWithValue.concat(
        existingResult.variables.filter(
          (resultVariable) =>
            isDefined(resultVariable.value) &&
            !prefilledVariableWithValue.some(
              (prefilledVariable) =>
                prefilledVariable.name === resultVariable.name
            )
        )
      ) as VariableWithValue[],
    }
    await prisma.result.updateMany({
      where: { id: existingResult.id },
      data: updatedResult,
    })
    return {
      id: existingResult.id,
      variables: updatedResult.variables,
      answers: existingResult.answers,
    }
  } else {
    return (await prisma.result.create({
      data: {
        isCompleted: false,
        typebotId,
        variables: prefilledVariables.filter((variable) =>
          isDefined(variable.value)
        ),
      },
      select,
    })) as ResultInSession
  }
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
