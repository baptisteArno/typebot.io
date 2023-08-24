import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  ChatReply,
  chatReplySchema,
  GoogleAnalyticsBlock,
  IntegrationBlockType,
  PixelBlock,
  ReplyLog,
  sendMessageInputSchema,
  SessionState,
  StartParams,
  StartTypebot,
  Theme,
  Typebot,
  Variable,
  VariableWithValue,
} from '@typebot.io/schemas'
import { env, isDefined, isNotEmpty, omit } from '@typebot.io/lib'
import { prefillVariables } from '@/features/variables/prefillVariables'
import { injectVariablesFromExistingResult } from '@/features/variables/injectVariablesFromExistingResult'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { parseVariables } from '@/features/variables/parseVariables'
import { NodeType, parse } from 'node-html-parser'
import { saveStateToDatabase } from '../helpers/saveStateToDatabase'
import { getSession } from '../queries/getSession'
import { continueBotFlow } from '../helpers/continueBotFlow'
import { startBotFlow } from '../helpers/startBotFlow'
import { findTypebot } from '../queries/findTypebot'
import { findPublicTypebot } from '../queries/findPublicTypebot'
import { findResult } from '../queries/findResult'
import { createId } from '@paralleldrive/cuid2'

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
        const {
          sessionId,
          typebot,
          messages,
          input,
          resultId,
          dynamicTheme,
          logs,
          clientSideActions,
        } = await startSession(startParams, user?.id, clientLogs)
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
          dynamicTheme: parseDynamicThemeReply(newSessionState),
          logs,
          lastMessageNewFormat,
        }
      }
    }
  )

const startSession = async (
  startParams?: StartParams,
  userId?: string,
  clientLogs?: ReplyLog[]
) => {
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
    version: '2',
    typebotsQueue: [
      {
        resultId: result?.id,
        typebot: {
          id: typebot.id,
          groups: typebot.groups,
          edges: typebot.edges,
          variables: startVariables,
        },
        answers: [],
      },
    ],
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
        settings: deepParseVariables(
          newSessionState.typebotsQueue[0].typebot.variables
        )(typebot.settings),
        theme: deepParseVariables(
          newSessionState.typebotsQueue[0].typebot.variables
        )(typebot.theme),
      },
      dynamicTheme: parseDynamicThemeReply(newSessionState),
      logs: startLogs.length > 0 ? startLogs : undefined,
    }

  const allLogs = clientLogs ? [...(logs ?? []), ...clientLogs] : logs

  const session = await saveStateToDatabase({
    session: {
      state: newSessionState,
    },
    input,
    logs: allLogs,
    clientSideActions,
  })

  return {
    resultId: result?.id,
    sessionId: session.id,
    typebot: {
      id: typebot.id,
      settings: deepParseVariables(
        newSessionState.typebotsQueue[0].typebot.variables
      )(typebot.settings),
      theme: deepParseVariables(
        newSessionState.typebotsQueue[0].typebot.variables
      )(typebot.theme),
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
    ? await findTypebot({ id: typebot, userId })
    : await findPublicTypebot({ publicId: typebot })

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
  const existingResult =
    resultId && isRememberUserEnabled
      ? await findResult({ id: resultId })
      : undefined

  const prefilledVariableWithValue = prefilledVariables.filter(
    (prefilledVariable) => isDefined(prefilledVariable.value)
  )

  const updatedResult = {
    variables: prefilledVariableWithValue.concat(
      existingResult?.variables.filter(
        (resultVariable) =>
          isDefined(resultVariable.value) &&
          !prefilledVariableWithValue.some(
            (prefilledVariable) =>
              prefilledVariable.name === resultVariable.name
          )
      ) ?? []
    ) as VariableWithValue[],
  }
  return {
    id: existingResult?.id ?? createId(),
    variables: updatedResult.variables,
    answers: existingResult?.answers ?? [],
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
    hostAvatarUrl: parseVariables(state.typebotsQueue[0].typebot.variables)(
      state.dynamicTheme.hostAvatarUrl
    ),
    guestAvatarUrl: parseVariables(state.typebotsQueue[0].typebot.variables)(
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
