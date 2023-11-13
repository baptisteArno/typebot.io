import { createId } from '@paralleldrive/cuid2'
import { TRPCError } from '@trpc/server'
import { isDefined, omit, isNotEmpty, isInputBlock } from '@typebot.io/lib'
import {
  Variable,
  VariableWithValue,
  Theme,
  GoogleAnalyticsBlock,
  PixelBlock,
  SessionState,
  TypebotInSession,
  Block,
} from '@typebot.io/schemas'
import {
  StartChatInput,
  StartChatResponse,
  StartPreviewChatInput,
  StartTypebot,
  startTypebotSchema,
} from '@typebot.io/schemas/features/chat/schema'
import parse, { NodeType } from 'node-html-parser'
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
import { parseVariables } from './variables/parseVariables'
import { defaultSettings } from '@typebot.io/schemas/features/typebot/settings/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { defaultTheme } from '@typebot.io/schemas/features/typebot/theme/constants'
import { VisitedEdge } from '@typebot.io/prisma'
import { env } from '@typebot.io/env'

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
  message: string | undefined
  startParams: StartParams
  initialSessionState?: Pick<SessionState, 'whatsApp' | 'expiryTimeout'>
}

export const startSession = async ({
  version,
  message,
  startParams,
  initialSessionState,
}: Props): Promise<
  Omit<StartChatResponse, 'resultId'> & {
    newSessionState: SessionState
    visitedEdges: VisitedEdge[]
    resultId?: string
  }
> => {
  const typebot = await getTypebot(startParams)

  const prefilledVariables =
    startParams.type === 'live' && startParams.prefilledVariables
      ? prefillVariables(typebot.variables, startParams.prefilledVariables)
      : typebot.variables

  const result = await getResult({
    resultId: startParams.type === 'live' ? startParams.resultId : undefined,
    isPreview: startParams.type === 'preview',
    typebotId: typebot.id,
    prefilledVariables,
    isRememberUserEnabled:
      typebot.settings.general?.rememberUser?.isEnabled ??
      (isDefined(typebot.settings.general?.isNewResultOnRefreshEnabled)
        ? !typebot.settings.general?.isNewResultOnRefreshEnabled
        : defaultSettings.general.rememberUser.isEnabled),
  })

  const startVariables =
    result && result.variables.length > 0
      ? injectVariablesFromExistingResult(prefilledVariables, result.variables)
      : prefilledVariables

  const typebotInSession = convertStartTypebotToTypebotInSession(
    typebot,
    startVariables
  )

  const initialState: SessionState = {
    version: '3',
    typebotsQueue: [
      {
        resultId: result?.id,
        typebot: typebotInSession,
        answers: result
          ? result.answers.map((answer) => {
              const block = typebot.groups
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
        theme: sanitizeAndParseTheme(typebot.theme, {
          variables: initialState.typebotsQueue[0].typebot.variables,
        }),
      },
      dynamicTheme: parseDynamicTheme(initialState),
      messages: [],
      visitedEdges: [],
    }
  }

  let chatReply = await startBotFlow({
    version,
    state: initialState,
    startFrom:
      startParams.type === 'preview' ? startParams.startFrom : undefined,
  })

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
      chatReply = await continueBotFlow(message, {
        version,
        state: {
          ...newSessionState,
          currentBlockId: firstBlock.id,
        },
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
  } = chatReply

  const clientSideActions = startFlowClientActions ?? []

  const startClientSideAction = parseStartClientSideAction(typebot)

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
      typebot: {
        id: typebot.id,
        settings: deepParseVariables(
          newSessionState.typebotsQueue[0].typebot.variables
        )(typebot.settings),
        theme: sanitizeAndParseTheme(typebot.theme, {
          variables: initialState.typebotsQueue[0].typebot.variables,
        }),
      },
      dynamicTheme: parseDynamicTheme(newSessionState),
      logs: startLogs.length > 0 ? startLogs : undefined,
      visitedEdges,
    }

  return {
    newSessionState,
    resultId: result?.id,
    typebot: {
      id: typebot.id,
      settings: deepParseVariables(
        newSessionState.typebotsQueue[0].typebot.variables
      )(typebot.settings),
      theme: sanitizeAndParseTheme(typebot.theme, {
        variables: initialState.typebotsQueue[0].typebot.variables,
      }),
    },
    messages,
    input,
    clientSideActions:
      clientSideActions.length > 0 ? clientSideActions : undefined,
    dynamicTheme: parseDynamicTheme(newSessionState),
    logs: startLogs.length > 0 ? startLogs : undefined,
    visitedEdges,
  }
}

const getTypebot = async (startParams: StartParams): Promise<StartTypebot> => {
  if (startParams.type === 'preview' && startParams.typebot)
    return startParams.typebot

  if (
    startParams.type === 'preview' &&
    !startParams.userId &&
    !env.NEXT_PUBLIC_E2E_TEST
  )
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You need to be authenticated to perform this action',
    })

  const typebotQuery =
    startParams.type === 'preview'
      ? await findTypebot({
          id: startParams.typebotId,
          userId: startParams.userId,
        })
      : await findPublicTypebot({ publicId: startParams.publicId })

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
}: {
  resultId: string | undefined
  isPreview: boolean
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
    theme.chat?.hostAvatar?.isEnabled ?? defaultTheme.chat.hostAvatar.isEnabled
      ? theme.chat?.hostAvatar?.url
      : undefined
  const guestAvatarUrl =
    theme.chat?.guestAvatar?.isEnabled ??
    defaultTheme.chat.guestAvatar.isEnabled
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
  typebot: StartTypebot
): NonNullable<StartChatResponse['clientSideActions']>[number] | undefined => {
  const blocks = typebot.groups.flatMap<Block>((group) => group.blocks)
  const pixelBlocks = (
    blocks.filter(
      (block) =>
        block.type === IntegrationBlockType.PIXEL &&
        isNotEmpty(block.options?.pixelId) &&
        block.options?.isInitSkip !== true
    ) as PixelBlock[]
  ).map((pixelBlock) => pixelBlock.options?.pixelId as string)

  const startPropsToInject = {
    customHeadCode: isNotEmpty(typebot.settings.metadata?.customHeadCode)
      ? sanitizeAndParseHeadCode(
          typebot.settings.metadata?.customHeadCode as string
        )
      : undefined,
    gtmId: typebot.settings.metadata?.googleTagManagerId,
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

  return {
    startPropsToInject,
  }
}

const sanitizeAndParseTheme = (
  theme: Theme,
  { variables }: { variables: Variable[] }
): Theme => ({
  general: theme.general
    ? deepParseVariables(variables)(theme.general)
    : undefined,
  chat: theme.chat ? deepParseVariables(variables)(theme.chat) : undefined,
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

const convertStartTypebotToTypebotInSession = (
  typebot: StartTypebot,
  startVariables: Variable[]
): TypebotInSession =>
  typebot.version === '6'
    ? {
        version: typebot.version,
        id: typebot.id,
        groups: typebot.groups,
        edges: typebot.edges,
        variables: startVariables,
        events: typebot.events,
      }
    : {
        version: typebot.version,
        id: typebot.id,
        groups: typebot.groups,
        edges: typebot.edges,
        variables: startVariables,
        events: typebot.events,
      }
