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
import parse, { NodeType } from 'node-html-parser'
import { env } from '@typebot.io/env'
import { parseDynamicTheme } from './parseDynamicTheme'
import { findTypebot } from './queries/findTypebot'
import { findPublicTypebot } from './queries/findPublicTypebot'
import { findResult } from './queries/findResult'
import { startBotFlow } from './startBotFlow'
import { prefillVariables } from './variables/prefillVariables'
import { deepParseVariables } from './variables/deepParseVariables'
import { injectVariablesFromExistingResult } from './variables/injectVariablesFromExistingResult'
import { getNextGroup } from './getNextGroup'
import { upsertResult } from './queries/upsertResult'
import { continueBotFlow } from './continueBotFlow'

type Props = {
  message: string | undefined
  startParams: StartParams
  userId: string | undefined
  initialSessionState?: Pick<SessionState, 'whatsApp' | 'expiryTimeout'>
}

export const startSession = async ({
  message,
  startParams,
  userId,
  initialSessionState,
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
    ...initialSessionState,
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

  let chatReply = await startBotFlow(initialState, startParams.startGroupId)

  // If params has message and first block is an input block, we can directly continue the bot flow
  if (message) {
    const firstEdgeId =
      chatReply.newSessionState.typebotsQueue[0].typebot.groups[0].blocks[0]
        .outgoingEdgeId
    const nextGroup = await getNextGroup(chatReply.newSessionState)(firstEdgeId)
    const newSessionState = nextGroup.newSessionState
    const firstBlock = nextGroup.group?.blocks.at(0)
    if (firstBlock && isInputBlock(firstBlock)) {
      const resultId = newSessionState.typebotsQueue[0].resultId
      if (resultId)
        await upsertResult({
          hasStarted: true,
          isCompleted: false,
          resultId,
          typebot: newSessionState.typebotsQueue[0].typebot,
        })
      chatReply = await continueBotFlow({
        ...newSessionState,
        currentBlock: { groupId: firstBlock.groupId, blockId: firstBlock.id },
      })(message)
    }
  }

  const {
    messages,
    input,
    clientSideActions: startFlowClientActions,
    newSessionState,
    logs,
  } = chatReply

  const clientSideActions = startFlowClientActions ?? []

  const startClientSideAction = parseStartClientSideAction(typebot)

  const startLogs = logs ?? []

  if (isDefined(startClientSideAction)) {
    if (!result) {
      if ('startPropsToInject' in startClientSideAction) {
        const { customHeadCode, googleAnalyticsId, pixelId, pixelIds, gtmId } =
          startClientSideAction.startPropsToInject
        let toolsList = ''
        if (customHeadCode) toolsList += 'Custom head code, '
        if (googleAnalyticsId) toolsList += 'Google Analytics, '
        if (pixelId || pixelIds) toolsList += 'Pixel, '
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
  const pixelBlocks = (
    blocks.filter(
      (block) =>
        block.type === IntegrationBlockType.PIXEL &&
        isNotEmpty(block.options.pixelId) &&
        block.options.isInitSkip !== true
    ) as PixelBlock[]
  ).map((pixelBlock) => pixelBlock.options.pixelId as string)

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
    pixelIds: pixelBlocks.length > 0 ? pixelBlocks : undefined,
  }

  if (
    !startPropsToInject.customHeadCode &&
    !startPropsToInject.gtmId &&
    !startPropsToInject.googleAnalyticsId &&
    !startPropsToInject.pixelIds
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
