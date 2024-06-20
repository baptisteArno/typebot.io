import { createId } from '@paralleldrive/cuid2'
import { TRPCError } from '@trpc/server'
import { isDefined, omit, isNotEmpty } from '@sniper.io/lib'
import { isInputBlock } from '@sniper.io/schemas/helpers'
import {
  Variable,
  VariableWithValue,
  Theme,
  GoogleAnalyticsBlock,
  PixelBlock,
  SessionState,
  SniperInSession,
  Block,
  SetVariableHistoryItem,
} from '@sniper.io/schemas'
import {
  StartChatInput,
  StartChatResponse,
  StartPreviewChatInput,
  StartSniper,
  startSniperSchema,
} from '@sniper.io/schemas/features/chat/schema'
import parse, { NodeType } from 'node-html-parser'
import { parseDynamicTheme } from './parseDynamicTheme'
import { findSniper } from './queries/findSniper'
import { findPublicSniper } from './queries/findPublicSniper'
import { findResult } from './queries/findResult'
import { startBotFlow } from './startBotFlow'
import { prefillVariables } from '@sniper.io/variables/prefillVariables'
import { deepParseVariables } from '@sniper.io/variables/deepParseVariables'
import { injectVariablesFromExistingResult } from '@sniper.io/variables/injectVariablesFromExistingResult'
import { getNextGroup } from './getNextGroup'
import { upsertResult } from './queries/upsertResult'
import { continueBotFlow } from './continueBotFlow'
import {
  getVariablesToParseInfoInText,
  parseVariables,
} from '@sniper.io/variables/parseVariables'
import { defaultSettings } from '@sniper.io/schemas/features/sniper/settings/constants'
import { IntegrationBlockType } from '@sniper.io/schemas/features/blocks/integrations/constants'
import { VisitedEdge } from '@sniper.io/prisma'
import { env } from '@sniper.io/env'
import { getFirstEdgeId } from './getFirstEdgeId'
import { Reply } from './types'
import {
  defaultGuestAvatarIsEnabled,
  defaultHostAvatarIsEnabled,
} from '@sniper.io/schemas/features/sniper/theme/constants'
import { BubbleBlockType } from '@sniper.io/schemas/features/blocks/bubbles/constants'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'
import { parseVariablesInRichText } from './parseBubbleBlock'

type StartParams =
  | ({
      type: 'preview'
      userId?: string
    } & StartPreviewChatInput)
  | ({
      type: 'live'
    } & StartChatInput)

type Props = {
  version: 1 | 2
  message: Reply
  startParams: StartParams
  initialSessionState?: Pick<SessionState, 'whatsApp' | 'expiryTimeout'>
}

export const startSession = async ({
  version,
  message,
  startParams,
  initialSessionState,
}: Props): Promise<
  Omit<StartChatResponse, 'resultId' | 'isStreamEnabled' | 'sessionId'> & {
    newSessionState: SessionState
    visitedEdges: VisitedEdge[]
    setVariableHistory: SetVariableHistoryItem[]
    resultId?: string
  }
> => {
  const sniper = await getSniper(startParams)

  const prefilledVariables = startParams.prefilledVariables
    ? prefillVariables(sniper.variables, startParams.prefilledVariables)
    : sniper.variables

  const result = await getResult({
    resultId: startParams.type === 'live' ? startParams.resultId : undefined,
    isPreview: startParams.type === 'preview',
    sniperId: sniper.id,
    prefilledVariables,
    isRememberUserEnabled:
      sniper.settings.general?.rememberUser?.isEnabled ??
      (isDefined(sniper.settings.general?.isNewResultOnRefreshEnabled)
        ? !sniper.settings.general?.isNewResultOnRefreshEnabled
        : defaultSettings.general.rememberUser.isEnabled),
  })

  const startVariables =
    result && result.variables.length > 0
      ? injectVariablesFromExistingResult(prefilledVariables, result.variables)
      : prefilledVariables

  const sniperInSession = convertStartSniperToSniperInSession(
    sniper,
    startVariables
  )

  const initialState: SessionState = {
    version: '3',
    snipersQueue: [
      {
        resultId: result?.id,
        sniper: sniperInSession,
        answers: result
          ? result.answers.map((answer) => {
              const block = sniper.groups
                .flatMap<Block>((group) => group.blocks)
                .find((block) => block.id === answer.blockId)
              if (!block || !isInputBlock(block))
                return {
                  key: 'unknown',
                  value: answer.content,
                }
              const key =
                (block.options?.variableId
                  ? startVariables.find(
                      (variable) => variable.id === block.options?.variableId
                    )?.name
                  : sniper.groups.find((group) =>
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
    dynamicTheme: parseDynamicThemeInState(sniper.theme),
    isStreamEnabled: startParams.isStreamEnabled,
    typingEmulation: sniper.settings.typingEmulation,
    allowedOrigins:
      startParams.type === 'preview'
        ? undefined
        : sniper.settings.security?.allowedOrigins,
    progressMetadata: initialSessionState?.whatsApp
      ? undefined
      : sniper.theme.general?.progressBar?.isEnabled
      ? { totalAnswers: 0 }
      : undefined,
    setVariableIdsForHistory:
      extractVariableIdsUsedForTranscript(sniperInSession),
    ...initialSessionState,
  }

  if (startParams.isOnlyRegistering) {
    return {
      newSessionState: initialState,
      sniper: {
        id: sniper.id,
        settings: deepParseVariables(
          initialState.snipersQueue[0].sniper.variables,
          { removeEmptyStrings: true }
        )(sniper.settings),
        theme: sanitizeAndParseTheme(sniper.theme, {
          variables: initialState.snipersQueue[0].sniper.variables,
        }),
      },
      dynamicTheme: parseDynamicTheme(initialState),
      messages: [],
      visitedEdges: [],
      setVariableHistory: [],
    }
  }

  let chatReply = await startBotFlow({
    version,
    state: initialState,
    startFrom:
      startParams.type === 'preview' ? startParams.startFrom : undefined,
    startTime: Date.now(),
    textBubbleContentFormat: startParams.textBubbleContentFormat,
  })

  // If params has message and first block is an input block, we can directly continue the bot flow
  if (message) {
    const firstEdgeId = getFirstEdgeId({
      sniper: chatReply.newSessionState.snipersQueue[0].sniper,
      startEventId:
        startParams.type === 'preview' &&
        startParams.startFrom?.type === 'event'
          ? startParams.startFrom.eventId
          : undefined,
    })
    const nextGroup = await getNextGroup({
      state: chatReply.newSessionState,
      edgeId: firstEdgeId,
      isOffDefaultPath: false,
    })
    const newSessionState = nextGroup.newSessionState
    const firstBlock = nextGroup.group?.blocks.at(0)
    if (firstBlock && isInputBlock(firstBlock)) {
      const resultId = newSessionState.snipersQueue[0].resultId
      if (resultId)
        await upsertResult({
          hasStarted: true,
          isCompleted: false,
          resultId,
          sniper: newSessionState.snipersQueue[0].sniper,
        })
      chatReply = await continueBotFlow(message, {
        version,
        state: {
          ...newSessionState,
          currentBlockId: firstBlock.id,
        },
        textBubbleContentFormat: startParams.textBubbleContentFormat,
      })
    }
  }

  const {
    messages,
    input,
    clientSideActions: startFlowClientActions,
    newSessionState,
    logs,
    visitedEdges,
    setVariableHistory,
  } = chatReply

  const clientSideActions = startFlowClientActions ?? []

  const startClientSideAction = parseStartClientSideAction(sniper)

  const startLogs = logs ?? []

  if (isDefined(startClientSideAction)) {
    if (!result) {
      if ('startPropsToInject' in startClientSideAction) {
        const { customHeadCode, googleAnalyticsId, pixelIds, gtmId } =
          startClientSideAction.startPropsToInject
        let toolsList = ''
        if (customHeadCode) toolsList += 'Custom head code, '
        if (googleAnalyticsId) toolsList += 'Google Analytics, '
        if (pixelIds) toolsList += 'Pixel, '
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
      sniper: {
        id: sniper.id,
        settings: deepParseVariables(
          newSessionState.snipersQueue[0].sniper.variables,
          { removeEmptyStrings: true }
        )(sniper.settings),
        theme: sanitizeAndParseTheme(sniper.theme, {
          variables: initialState.snipersQueue[0].sniper.variables,
        }),
      },
      dynamicTheme: parseDynamicTheme(newSessionState),
      logs: startLogs.length > 0 ? startLogs : undefined,
      visitedEdges,
      setVariableHistory,
    }

  return {
    newSessionState,
    resultId: result?.id,
    sniper: {
      id: sniper.id,
      settings: deepParseVariables(
        newSessionState.snipersQueue[0].sniper.variables,
        { removeEmptyStrings: true }
      )(sniper.settings),
      theme: sanitizeAndParseTheme(sniper.theme, {
        variables: initialState.snipersQueue[0].sniper.variables,
      }),
    },
    messages,
    input,
    clientSideActions:
      clientSideActions.length > 0 ? clientSideActions : undefined,
    dynamicTheme: parseDynamicTheme(newSessionState),
    logs: startLogs.length > 0 ? startLogs : undefined,
    visitedEdges,
    setVariableHistory,
  }
}

const getSniper = async (startParams: StartParams): Promise<StartSniper> => {
  if (startParams.type === 'preview' && startParams.sniper)
    return startParams.sniper

  if (
    startParams.type === 'preview' &&
    !startParams.userId &&
    !env.NEXT_PUBLIC_E2E_TEST
  )
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You need to be authenticated to perform this action',
    })

  const sniperQuery =
    startParams.type === 'preview'
      ? await findSniper({
          id: startParams.sniperId,
          userId: startParams.userId,
        })
      : await findPublicSniper({ publicId: startParams.publicId })

  const parsedSniper =
    sniperQuery && 'sniper' in sniperQuery
      ? {
          id: sniperQuery.sniperId,
          ...omit(sniperQuery.sniper, 'workspace'),
          ...omit(sniperQuery, 'sniper', 'sniperId'),
        }
      : sniperQuery

  if (!parsedSniper || parsedSniper.isArchived)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Sniper not found',
    })

  const isQuarantinedOrSuspended =
    sniperQuery &&
    'sniper' in sniperQuery &&
    (sniperQuery.sniper.workspace.isQuarantined ||
      sniperQuery.sniper.workspace.isSuspended)

  if (
    ('isClosed' in parsedSniper && parsedSniper.isClosed) ||
    isQuarantinedOrSuspended
  )
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Sniper is closed',
    })

  return startSniperSchema.parse(parsedSniper)
}

const getResult = async ({
  isPreview,
  resultId,
  prefilledVariables,
  isRememberUserEnabled,
}: {
  resultId: string | undefined
  isPreview: boolean
  sniperId: string
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
    theme.chat?.hostAvatar?.isEnabled ?? defaultHostAvatarIsEnabled
      ? theme.chat?.hostAvatar?.url
      : undefined
  const guestAvatarUrl =
    theme.chat?.guestAvatar?.isEnabled ?? defaultGuestAvatarIsEnabled
      ? theme.chat?.guestAvatar?.url
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
  sniper: StartSniper
): NonNullable<StartChatResponse['clientSideActions']>[number] | undefined => {
  const blocks = sniper.groups.flatMap<Block>((group) => group.blocks)
  const pixelBlocks = (
    blocks.filter(
      (block) =>
        block.type === IntegrationBlockType.PIXEL &&
        isNotEmpty(block.options?.pixelId) &&
        block.options?.isInitSkip !== true
    ) as PixelBlock[]
  ).map((pixelBlock) => pixelBlock.options?.pixelId as string)

  const startPropsToInject = {
    customHeadCode: isNotEmpty(sniper.settings.metadata?.customHeadCode)
      ? sanitizeAndParseHeadCode(
          sniper.settings.metadata?.customHeadCode as string
        )
      : undefined,
    gtmId: sniper.settings.metadata?.googleTagManagerId,
    googleAnalyticsId: (
      blocks.find(
        (block) =>
          block.type === IntegrationBlockType.GOOGLE_ANALYTICS &&
          block.options?.trackingId
      ) as GoogleAnalyticsBlock | undefined
    )?.options?.trackingId,
    pixelIds: pixelBlocks.length > 0 ? pixelBlocks : undefined,
  }

  if (
    !startPropsToInject.customHeadCode &&
    !startPropsToInject.gtmId &&
    !startPropsToInject.googleAnalyticsId &&
    !startPropsToInject.pixelIds
  )
    return

  return { type: 'startPropsToInject', startPropsToInject }
}

const sanitizeAndParseTheme = (
  theme: Theme,
  { variables }: { variables: Variable[] }
): Theme => ({
  general: theme.general
    ? deepParseVariables(variables, { removeEmptyStrings: true })(theme.general)
    : undefined,
  chat: theme.chat
    ? deepParseVariables(variables, { removeEmptyStrings: true })(theme.chat)
    : undefined,
  customCss: theme.customCss
    ? removeLiteBadgeCss(parseVariables(variables)(theme.customCss))
    : undefined,
})

const sanitizeAndParseHeadCode = (code: string) => {
  code = removeLiteBadgeCss(code)
  return parse(code)
    .childNodes.filter((child) => child.nodeType !== NodeType.TEXT_NODE)
    .join('\n')
}

const removeLiteBadgeCss = (code: string) => {
  const liteBadgeCssRegex = /.*#lite-badge.*{[\s\S][^{]*}/gm
  return code.replace(liteBadgeCssRegex, '')
}

const convertStartSniperToSniperInSession = (
  sniper: StartSniper,
  startVariables: Variable[]
): SniperInSession =>
  sniper.version === '6'
    ? {
        version: sniper.version,
        id: sniper.id,
        groups: sniper.groups,
        edges: sniper.edges,
        variables: startVariables,
        events: sniper.events,
      }
    : {
        version: sniper.version,
        id: sniper.id,
        groups: sniper.groups,
        edges: sniper.edges,
        variables: startVariables,
        events: sniper.events,
      }

const extractVariableIdsUsedForTranscript = (
  sniper: SniperInSession
): string[] => {
  const variableIds: Set<string> = new Set()
  const parseVarParams = {
    variables: sniper.variables,
    takeLatestIfList: sniper.version !== '6',
  }
  sniper.groups.forEach((group) => {
    group.blocks.forEach((block) => {
      if (block.type === BubbleBlockType.TEXT) {
        const { parsedVariableIds } = parseVariablesInRichText(
          block.content?.richText ?? [],
          parseVarParams
        )
        parsedVariableIds.forEach((variableId) => variableIds.add(variableId))
      }
      if (
        block.type === BubbleBlockType.IMAGE ||
        block.type === BubbleBlockType.VIDEO ||
        block.type === BubbleBlockType.AUDIO
      ) {
        if (!block.content?.url) return
        const variablesInfo = getVariablesToParseInfoInText(
          block.content.url,
          parseVarParams
        )
        variablesInfo.forEach((variableInfo) =>
          variableInfo.variableId
            ? variableIds.add(variableInfo.variableId ?? '')
            : undefined
        )
      }
      if (block.type === LogicBlockType.CONDITION) {
        block.items.forEach((item) =>
          item.content?.comparisons?.forEach((comparison) => {
            if (comparison.variableId) variableIds.add(comparison.variableId)
            if (comparison.value) {
              const variableIdsInValue = getVariablesToParseInfoInText(
                comparison.value,
                parseVarParams
              )
              variableIdsInValue.forEach((variableInfo) => {
                variableInfo.variableId
                  ? variableIds.add(variableInfo.variableId)
                  : undefined
              })
            }
          })
        )
      }
    })
  })
  return [...variableIds]
}
