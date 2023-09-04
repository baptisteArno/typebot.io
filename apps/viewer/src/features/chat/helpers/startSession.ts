import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { injectVariablesFromExistingResult } from '@/features/variables/injectVariablesFromExistingResult'
import { prefillVariables } from '@/features/variables/prefillVariables'
import { createId } from '@paralleldrive/cuid2'
import { TRPCError } from '@trpc/server'
import { isDefined, omit, isNotEmpty, isInputBlock } from '@typebot.io/lib'
import {
  Variable,
  VariableWithValue,
  Theme,
  IntegrationBlockType,
  GoogleAnalyticsBlock,
  PixelBlock,
  SessionState,
} from '@typebot.io/schemas'
import {
  ChatReply,
  StartParams,
  StartTypebot,
  startTypebotSchema,
} from '@typebot.io/schemas/features/chat/schema'
import { findPublicTypebot } from '../queries/findPublicTypebot'
import { findResult } from '../queries/findResult'
import { findTypebot } from '../queries/findTypebot'
import { startBotFlow } from './startBotFlow'
import parse, { NodeType } from 'node-html-parser'
import { parseDynamicTheme } from './parseDynamicTheme'
import { env } from '@typebot.io/env'

type Props = {
  startParams: StartParams
  userId: string | undefined
}

export const startSession = async ({
  startParams,
  userId,
}: Props): Promise<ChatReply & { newSessionState: SessionState }> => {
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
          version: typebot.version,
          id: typebot.id,
          groups: typebot.groups,
          edges: typebot.edges,
          variables: startVariables,
        },
        answers: result
          ? result.answers.map((answer) => {
              const block = typebot.groups
                .flatMap((group) => group.blocks)
                .find((block) => block.id === answer.blockId)
              if (!block || !isInputBlock(block))
                return {
                  key: 'unknown',
                  value: answer.content,
                }
              const key =
                (block.options.variableId
                  ? startVariables.find(
                      (variable) => variable.id === block.options.variableId
                    )?.name
                  : typebot.groups.find((group) =>
                      group.blocks.find(
                        (blockInGroup) => blockInGroup.id === block.id
                      )
                    )?.title) ?? 'unknown'
              return {
                key,
                value: answer.content,
              }
            })
          : [],
      },
    ],
    dynamicTheme: parseDynamicThemeInState(typebot.theme),
    isStreamEnabled: startParams.isStreamEnabled,
    typingEmulation: typebot.settings.typingEmulation,
  }

  if (startParams.isOnlyRegistering) {
    return {
      newSessionState: initialState,
      typebot: {
        id: typebot.id,
        settings: deepParseVariables(
          initialState.typebotsQueue[0].typebot.variables
        )(typebot.settings),
        theme: deepParseVariables(
          initialState.typebotsQueue[0].typebot.variables
        )(typebot.theme),
      },
      dynamicTheme: parseDynamicTheme(initialState),
      messages: [],
    }
  }

  const {
    messages,
    input,
    clientSideActions: startFlowClientActions,
    newSessionState,
    logs,
  } = await startBotFlow(initialState, startParams.startGroupId)

  const clientSideActions = startFlowClientActions ?? []

  const startClientSideAction = parseStartClientSideAction(typebot)

  const startLogs = logs ?? []

  if (isDefined(startClientSideAction)) {
    if (!result) {
      if ('startPropsToInject' in startClientSideAction) {
        const { customHeadCode, googleAnalyticsId, pixelId, gtmId } =
          startClientSideAction.startPropsToInject
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
      clientSideActions.unshift(startClientSideAction)
    }
  }

  const clientSideActionsNeedSessionId = clientSideActions?.some(
    (action) => action.expectsDedicatedReply
  )

  if (!input && !clientSideActionsNeedSessionId)
    return {
      newSessionState,
      messages,
      clientSideActions:
        clientSideActions.length > 0 ? clientSideActions : undefined,
      typebot: {
        id: typebot.id,
        settings: deepParseVariables(
          newSessionState.typebotsQueue[0].typebot.variables
        )(typebot.settings),
        theme: deepParseVariables(
          newSessionState.typebotsQueue[0].typebot.variables
        )(typebot.theme),
      },
      dynamicTheme: parseDynamicTheme(newSessionState),
      logs: startLogs.length > 0 ? startLogs : undefined,
    }

  return {
    newSessionState,
    resultId: result?.id,
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
      clientSideActions.length > 0 ? clientSideActions : undefined,
    dynamicTheme: parseDynamicTheme(newSessionState),
    logs: startLogs.length > 0 ? startLogs : undefined,
  }
}

const getTypebot = async (
  { typebot, isPreview }: Pick<StartParams, 'typebot' | 'isPreview'>,
  userId?: string
): Promise<StartTypebot> => {
  if (typeof typebot !== 'string') return typebot
  if (isPreview && !userId && !env.NEXT_PUBLIC_E2E_TEST)
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
      ? {
          id: typebotQuery.typebotId,
          ...omit(typebotQuery.typebot, 'workspace'),
          ...omit(typebotQuery, 'typebot', 'typebotId'),
        }
      : typebotQuery

  if (!parsedTypebot || parsedTypebot.isArchived)
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

  return startTypebotSchema.parse(parsedTypebot)
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
