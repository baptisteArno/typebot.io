import prisma from '@/lib/prisma'
import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@typebot.io/prisma'
import {
  ChatReply,
  chatReplySchema,
  ChatSession,
  GoogleAnalyticsBlock,
  IntegrationBlockType,
  PixelBlock,
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
import { env, isDefined, isNotEmpty, omit } from '@typebot.io/lib'
import { prefillVariables } from '@/features/variables/prefillVariables'
import { injectVariablesFromExistingResult } from '@/features/variables/injectVariablesFromExistingResult'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { parseVariables } from '@/features/variables/parseVariables'
import { saveLog } from '@/features/logs/saveLog'
import { NodeType, parse } from 'node-html-parser'

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
    async ({
      input: { sessionId, message, startParams, clientLogs },
      ctx: { user },
    }) => {
      const session = sessionId ? await getSession(sessionId) : null

      if (clientLogs) {
        for (const log of clientLogs) {
          await saveLog({
            message: log.description,
            status: log.status as 'error' | 'success' | 'info',
            resultId: session?.state.result.id,
            details: log.details,
          })
        }
      }

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
  if (!startParams)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'StartParams are missing',
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
    isRememberUserEnabled:
      typebot.settings.general.rememberUser?.isEnabled ??
      (isDefined(typebot.settings.general.isNewResultOnRefreshEnabled)
        ? !typebot.settings.general.isNewResultOnRefreshEnabled
        : false),
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
    isStreamEnabled: startParams.isStreamEnabled,
  }

  const { messages, input, clientSideActions, newSessionState, logs } =
    await startBotFlow(initialState, startParams.startGroupId)

  const clientSideActionsNeedSessionId = clientSideActions?.some(
    (action) =>
      'setVariable' in action || 'streamOpenAiChatCompletion' in action
  )

  const startClientSideAction = clientSideActions ?? []

  const parsedStartPropsActions = parseStartClientSideAction(typebot)

  const startLogs = logs ?? []

  if (isDefined(parsedStartPropsActions)) {
    if (!result) {
      if ('startPropsToInject' in parsedStartPropsActions) {
        const { customHeadCode, googleAnalyticsId, pixelId, gtmId } =
          parsedStartPropsActions.startPropsToInject
        let toolsList = ''
        if (customHeadCode) toolsList += 'Custom head code, '
        if (googleAnalyticsId) toolsList += 'Google Analytics, '
        if (pixelId) toolsList += 'Pixel, '
        if (gtmId) toolsList += 'Google Tag Manager, '
        toolsList = toolsList.slice(0, -2)
        startLogs.push({
          description: `${toolsList} ${
            toolsList.includes(',') ? 'are not' : 'is not'
          } enabled in Preview mode`,
          status: 'info',
        })
      }
    } else {
      startClientSideAction.push(parsedStartPropsActions)
    }
  }

  if (!input && !clientSideActionsNeedSessionId)
    return {
      messages,
      clientSideActions:
        startClientSideAction.length > 0 ? startClientSideAction : undefined,
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
      logs: startLogs.length > 0 ? startLogs : undefined,
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
    clientSideActions:
      startClientSideAction.length > 0 ? startClientSideAction : undefined,
    dynamicTheme: parseDynamicThemeReply(newSessionState),
    logs: startLogs.length > 0 ? startLogs : undefined,
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
                  isSuspended: true,
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

  const isQuarantinedOrSuspended =
    typebotQuery &&
    'typebot' in typebotQuery &&
    (typebotQuery.typebot.workspace.isQuarantined ||
      typebotQuery.typebot.workspace.isSuspended)

  if (
    ('isClosed' in parsedTypebot && parsedTypebot.isClosed) ||
    isQuarantinedOrSuspended
  )
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
  isRememberUserEnabled,
}: Pick<StartParams, 'isPreview' | 'resultId'> & {
  typebotId: string
  prefilledVariables: Variable[]
  isRememberUserEnabled: boolean
}) => {
  if (isPreview) return
  const select = {
    id: true,
    variables: true,
    answers: { select: { blockId: true, variableId: true, content: true } },
  } satisfies Prisma.ResultSelect

  const existingResult =
    resultId && isRememberUserEnabled
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

const parseStartClientSideAction = (
  typebot: StartTypebot
): NonNullable<ChatReply['clientSideActions']>[number] | undefined => {
  const blocks = typebot.groups.flatMap((group) => group.blocks)
  const startPropsToInject = {
    customHeadCode: isNotEmpty(typebot.settings.metadata.customHeadCode)
      ? parseHeadCode(typebot.settings.metadata.customHeadCode)
      : undefined,
    gtmId: typebot.settings.metadata.googleTagManagerId,
    googleAnalyticsId: (
      blocks.find(
        (block) =>
          block.type === IntegrationBlockType.GOOGLE_ANALYTICS &&
          block.options.trackingId
      ) as GoogleAnalyticsBlock | undefined
    )?.options.trackingId,
    pixelId: (
      blocks.find(
        (block) =>
          block.type === IntegrationBlockType.PIXEL &&
          block.options.pixelId &&
          block.options.isInitSkip !== true
      ) as PixelBlock | undefined
    )?.options.pixelId,
  }

  if (
    !startPropsToInject.customHeadCode &&
    !startPropsToInject.gtmId &&
    !startPropsToInject.googleAnalyticsId &&
    !startPropsToInject.pixelId
  )
    return

  return {
    startPropsToInject,
  }
}

const parseHeadCode = (code: string) => {
  code = injectTryCatch(code)
  return parse(code)
    .childNodes.filter((child) => child.nodeType !== NodeType.TEXT_NODE)
    .join('\n')
}

const injectTryCatch = (headCode: string) => {
  const scriptTagRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
  const scriptTags = headCode.match(scriptTagRegex)
  if (scriptTags) {
    scriptTags.forEach(function (tag) {
      const wrappedTag = tag.replace(
        /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,
        function (_, openingTag, content, closingTag) {
          if (!isValidJsSyntax(content)) return ''
          return `${openingTag}
try {
  ${content}
} catch (e) {
  console.warn(e); 
}
${closingTag}`
        }
      )
      headCode = headCode.replace(tag, wrappedTag)
    })
  }
  return headCode
}

const isValidJsSyntax = (snippet: string): boolean => {
  try {
    new Function(snippet)
    return true
  } catch (err) {
    return false
  }
}
