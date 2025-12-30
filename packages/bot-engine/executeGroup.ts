import {
  ContinueChatResponse,
  Group,
  InputBlock,
  RuntimeOptions,
  SessionState,
  SetVariableHistoryItem,
  Variable,
} from '@typebot.io/schemas'
import { isNotEmpty } from '@typebot.io/lib'
import {
  isBubbleBlock,
  isInputBlock,
  isIntegrationBlock,
  isLogicBlock,
} from '@typebot.io/schemas/helpers'
import { getNextGroup } from './getNextGroup'
import { executeLogic } from './executeLogic'
import { executeIntegration } from './executeIntegration'
import { computePaymentInputRuntimeOptions } from './blocks/inputs/payment/computePaymentInputRuntimeOptions'
import { injectVariableValuesInButtonsInputBlock } from './blocks/inputs/buttons/injectVariableValuesInButtonsInputBlock'
import { injectVariableValuesInPictureChoiceBlock } from './blocks/inputs/pictureChoice/injectVariableValuesInPictureChoiceBlock'
import { getPrefilledInputValue } from './getPrefilledValue'
import { parseDateInput } from './blocks/inputs/date/parseDateInput'
import { deepParseVariables } from '@typebot.io/variables/deepParseVariables'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'

import { VisitedEdge } from '@typebot.io/prisma'
import { env } from '@typebot.io/env'
import { TRPCError } from '@trpc/server'
import { ExecuteIntegrationResponse, ExecuteLogicResponse } from './types'
import { createId } from '@paralleldrive/cuid2'
import {
  BubbleBlockWithDefinedContent,
  parseBubbleBlock,
} from './parseBubbleBlock'
import logger from '@typebot.io/lib/logger'

type ContextProps = {
  version: 1 | 2
  state: SessionState
  currentReply?: ContinueChatResponse
  currentLastBubbleId?: string
  firstBubbleWasStreamed?: boolean
  visitedEdges: VisitedEdge[]
  setVariableHistory: SetVariableHistoryItem[]
  startTime?: number
  textBubbleContentFormat: 'richText' | 'markdown'
  sessionId?: string
}

export const executeGroup = async (
  group: Group,
  {
    version,
    state,
    visitedEdges,
    setVariableHistory,
    currentReply,
    currentLastBubbleId,
    firstBubbleWasStreamed,
    startTime,
    textBubbleContentFormat,
    sessionId,
  }: ContextProps
): Promise<
  ContinueChatResponse & {
    newSessionState: SessionState
    setVariableHistory: SetVariableHistoryItem[]
    visitedEdges: VisitedEdge[]
  }
> => {
  let newStartTime = startTime
  const messages: ContinueChatResponse['messages'] =
    currentReply?.messages ?? []
  let clientSideActions: ContinueChatResponse['clientSideActions'] =
    currentReply?.clientSideActions
  let logs: ContinueChatResponse['logs'] = currentReply?.logs
  let nextEdgeId = null
  let lastBubbleBlockId: string | undefined = currentLastBubbleId

  let newSessionState = state

  logger.info('executeGroup starting', {
    groupId: group.id,
    groupTitle: group.title,
    blocksCount: group.blocks.length,
    sessionId,
    typebotId: state.typebotsQueue[0].typebot.typebotId,
  })

  let isNextEdgeOffDefaultPath = false
  let index = -1
  for (const block of group.blocks) {
    const blockStartTime = Date.now()
    if (
      newStartTime &&
      env.CHAT_API_TIMEOUT &&
      Date.now() - newStartTime > env.CHAT_API_TIMEOUT
    ) {
      logger.warn('executeGroup timeout', {
        groupId: group.id,
        blockId: block.id,
        duration: Date.now() - newStartTime,
      })
      throw new TRPCError({
        code: 'TIMEOUT',
        message: `${env.CHAT_API_TIMEOUT / 1000} seconds timeout reached`,
      })
    }

    index++
    nextEdgeId = block.outgoingEdgeId

    logger.info('Block execution starting', {
      blockId: block.id,
      type: block.type,
      groupId: group.id,
      groupTitle: group.title,
      message: getBlockLabel(block, newSessionState.typebotsQueue[0].typebot.variables),
      sessionId,
    })

    if (isBubbleBlock(block)) {
      if (!block.content || (firstBubbleWasStreamed && index === 0)) {
        logger.info('Block execution finished', {
          blockId: block.id,
          duration: Date.now() - blockStartTime,
          skipped: true
        })
        continue
      }
      messages.push(
        parseBubbleBlock(block as BubbleBlockWithDefinedContent, {
          version,
          variables: newSessionState.typebotsQueue[0].typebot.variables,
          typebotVersion: newSessionState.typebotsQueue[0].typebot.version,
          textBubbleContentFormat,
        })
      )
      lastBubbleBlockId = block.id
      logger.info('Block execution finished', {
        blockId: block.id,
        duration: Date.now() - blockStartTime,
      })
      continue
    }

    if (isInputBlock(block)) {
      const inputResult = {
        messages,
        input: await parseInput(newSessionState)(block),
        newSessionState: {
          ...newSessionState,
          currentBlockId: block.id,
        },
        clientSideActions,
        logs,
        visitedEdges,
        setVariableHistory,
      }
      logger.info('Block execution finished', {
        blockId: block.id,
        duration: Date.now() - blockStartTime,
        inputExpected: true,
      })
      return inputResult
    }

    const executionResponse = (
      isLogicBlock(block)
        ? await executeLogic(newSessionState)(block)
        : isIntegrationBlock(block)
          ? await executeIntegration(newSessionState, sessionId)(block)
          : null
    ) as ExecuteLogicResponse | ExecuteIntegrationResponse | null

    if (!executionResponse) {
      logger.info('Block execution finished', {
        blockId: block.id,
        duration: Date.now() - blockStartTime,
        noResponse: true,
      })
      continue
    }

    if (
      executionResponse.newSetVariableHistory &&
      executionResponse.newSetVariableHistory?.length > 0
    ) {
      if (!newSessionState.typebotsQueue[0].resultId)
        newSessionState = {
          ...newSessionState,
          previewMetadata: {
            ...newSessionState.previewMetadata,
            setVariableHistory: (
              newSessionState.previewMetadata?.setVariableHistory ?? []
            ).concat(
              executionResponse.newSetVariableHistory.map((item) => ({
                blockId: item.blockId,
                variableId: item.variableId,
                value: item.value,
              }))
            ),
          },
        }
      else setVariableHistory.push(...executionResponse.newSetVariableHistory)
    }

    if (
      'startTimeShouldBeUpdated' in executionResponse &&
      executionResponse.startTimeShouldBeUpdated
    )
      newStartTime = Date.now()
    if (executionResponse.logs)
      logs = [...(logs ?? []), ...executionResponse.logs]
    if (executionResponse.newSessionState)
      newSessionState = executionResponse.newSessionState
    if (
      'clientSideActions' in executionResponse &&
      executionResponse.clientSideActions
    ) {
      clientSideActions = [
        ...(clientSideActions ?? []),
        ...executionResponse.clientSideActions.map((action) => ({
          ...action,
          lastBubbleBlockId,
        })),
      ]
      if (
        'customEmbedBubble' in executionResponse &&
        executionResponse.customEmbedBubble
      ) {
        messages.push({
          id: createId(),
          ...executionResponse.customEmbedBubble,
        })
      }
      if (
        executionResponse.clientSideActions?.find(
          (action) => action.expectsDedicatedReply
        ) ||
        ('customEmbedBubble' in executionResponse &&
          executionResponse.customEmbedBubble)
      ) {
        logger.info('Block execution finished', {
          blockId: block.id,
          duration: Date.now() - blockStartTime,
          clientSideAction: true,
        })
        return {
          messages,
          newSessionState: {
            ...newSessionState,
            currentBlockId: block.id,
          },
          clientSideActions,
          logs,
          visitedEdges,
          setVariableHistory,
        }
      }
    }

    if (executionResponse.outgoingEdgeId) {
      isNextEdgeOffDefaultPath =
        block.outgoingEdgeId !== executionResponse.outgoingEdgeId
      nextEdgeId = executionResponse.outgoingEdgeId
      logger.info('Block execution finished', {
        blockId: block.id,
        duration: Date.now() - blockStartTime,
        outgoingEdgeId: nextEdgeId,
      })
      break
    }

    logger.info('Block execution finished', {
      blockId: block.id,
      duration: Date.now() - blockStartTime,
    })
  }

  if (!nextEdgeId && newSessionState.typebotsQueue.length === 1)
    return {
      messages,
      newSessionState,
      clientSideActions,
      logs,
      visitedEdges,
      setVariableHistory,
    }

  const nextGroup = await getNextGroup({
    state: newSessionState,
    edgeId: nextEdgeId ?? undefined,
    isOffDefaultPath: isNextEdgeOffDefaultPath,
  })

  newSessionState = nextGroup.newSessionState

  if (nextGroup.visitedEdge) visitedEdges.push(nextGroup.visitedEdge)

  if (!nextGroup.group) {
    return {
      messages,
      newSessionState,
      clientSideActions,
      logs,
      visitedEdges,
      setVariableHistory,
    }
  }

  return executeGroup(nextGroup.group, {
    version,
    state: newSessionState,
    visitedEdges,
    setVariableHistory,
    currentReply: {
      messages,
      clientSideActions,
      logs,
    },
    currentLastBubbleId: lastBubbleBlockId,
    startTime: newStartTime,
    textBubbleContentFormat,
    sessionId,
  })
}

const computeRuntimeOptions =
  (state: SessionState) =>
    (block: InputBlock): Promise<RuntimeOptions> | undefined => {
      switch (block.type) {
        case InputBlockType.PAYMENT: {
          return computePaymentInputRuntimeOptions(state)(block.options)
        }
      }
    }

export const parseInput =
  (state: SessionState) =>
    async (block: InputBlock): Promise<ContinueChatResponse['input']> => {
      switch (block.type) {
        case InputBlockType.CHOICE: {
          return injectVariableValuesInButtonsInputBlock(state)(block)
        }
        case InputBlockType.PICTURE_CHOICE: {
          return injectVariableValuesInPictureChoiceBlock(
            state.typebotsQueue[0].typebot.variables
          )(block)
        }
        case InputBlockType.NUMBER: {
          const parsedBlock = deepParseVariables(
            state.typebotsQueue[0].typebot.variables,
            { removeEmptyStrings: true }
          )({
            ...block,
            prefilledValue: getPrefilledInputValue(
              state.typebotsQueue[0].typebot.variables
            )(block),
          })
          return {
            ...parsedBlock,
            options: {
              ...parsedBlock.options,
              min: isNotEmpty(parsedBlock.options?.min as string)
                ? Number(parsedBlock.options?.min)
                : undefined,
              max: isNotEmpty(parsedBlock.options?.max as string)
                ? Number(parsedBlock.options?.max)
                : undefined,
              step: isNotEmpty(parsedBlock.options?.step as string)
                ? Number(parsedBlock.options?.step)
                : undefined,
            },
          }
        }
        case InputBlockType.DATE: {
          return parseDateInput(state)(block)
        }
        case InputBlockType.RATING: {
          const parsedBlock = deepParseVariables(
            state.typebotsQueue[0].typebot.variables,
            { removeEmptyStrings: true }
          )({
            ...block,
            prefilledValue: getPrefilledInputValue(
              state.typebotsQueue[0].typebot.variables
            )(block),
          })
          return {
            ...parsedBlock,
            options: {
              ...parsedBlock.options,
              startsAt: isNotEmpty(parsedBlock.options?.startsAt as string)
                ? Number(parsedBlock.options?.startsAt)
                : undefined,
            },
          }
        }
        default: {
          return deepParseVariables(state.typebotsQueue[0].typebot.variables, {
            removeEmptyStrings: true,
          })({
            ...block,
            runtimeOptions: await computeRuntimeOptions(state)(block),
            prefilledValue: getPrefilledInputValue(
              state.typebotsQueue[0].typebot.variables
            )(block),
          })
        }
      }
    }

const getBlockLabel = (block: Group['blocks'][number], variables: Variable[]): string | undefined => {
  if (isBubbleBlock(block)) {
    if (block.type === BubbleBlockType.TEXT) {
      if (!block.content?.richText) return
      // @ts-ignore
      const text = block.content.richText
        // @ts-ignore
        .map((node) => node.children.map((child) => child.text).join(''))
        .join(' ')
      return text.slice(0, 50) + (text.length > 50 ? '...' : '')
    }
  }
  if (isInputBlock(block)) {
    // @ts-ignore
    const label = block.options?.labels?.placeholder ?? block.options?.labels?.button
    if (label) return label

    if (block.options?.variableId) {
      const variable = variables.find(v => v.id === block.options?.variableId)
      if (variable) return `Collect ${variable.name}`
    }
  }
  if (isIntegrationBlock(block)) {
    if (block.type === IntegrationBlockType.WEBHOOK) {
      const method = block?.options?.webhook?.method
      const url = block?.options?.webhook?.url
      if (method && url) return `${method} ${url}`
    }
    // @ts-ignore
    if (block.options?.action) return block.options.action
  }
  if (isLogicBlock(block)) {
    if (block.type === LogicBlockType.SCRIPT) {
      return block.options?.name ?? 'Run Script'
    }
    if (block.type === LogicBlockType.SET_VARIABLE) {
      // @ts-ignore
      const variableId = block.options?.variableId
      const variable = variables.find(v => v.id === variableId)
      if (variable) return `Set ${variable.name}`
    }
  }
}
