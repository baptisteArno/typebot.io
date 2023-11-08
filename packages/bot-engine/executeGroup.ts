import {
  ChatReply,
  Group,
  InputBlock,
  RuntimeOptions,
  SessionState,
} from '@typebot.io/schemas'
import {
  isBubbleBlock,
  isInputBlock,
  isIntegrationBlock,
  isLogicBlock,
  isNotEmpty,
} from '@typebot.io/lib'
import { getNextGroup } from './getNextGroup'
import { executeLogic } from './executeLogic'
import { executeIntegration } from './executeIntegration'
import { computePaymentInputRuntimeOptions } from './blocks/inputs/payment/computePaymentInputRuntimeOptions'
import { injectVariableValuesInButtonsInputBlock } from './blocks/inputs/buttons/injectVariableValuesInButtonsInputBlock'
import { injectVariableValuesInPictureChoiceBlock } from './blocks/inputs/pictureChoice/injectVariableValuesInPictureChoiceBlock'
import { getPrefilledInputValue } from './getPrefilledValue'
import { parseDateInput } from './blocks/inputs/date/parseDateInput'
import { deepParseVariables } from './variables/deepParseVariables'
import {
  BubbleBlockWithDefinedContent,
  parseBubbleBlock,
} from './parseBubbleBlock'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { VisitedEdge } from '@typebot.io/prisma'

type ContextProps = {
  version: 1 | 2
  state: SessionState
  currentReply?: ChatReply
  currentLastBubbleId?: string
  firstBubbleWasStreamed?: boolean
  visitedEdges: VisitedEdge[]
}

export const executeGroup = async (
  group: Group,
  {
    version,
    state,
    visitedEdges,
    currentReply,
    currentLastBubbleId,
    firstBubbleWasStreamed,
  }: ContextProps
): Promise<
  ChatReply & { newSessionState: SessionState; visitedEdges: VisitedEdge[] }
> => {
  const messages: ChatReply['messages'] = currentReply?.messages ?? []
  let clientSideActions: ChatReply['clientSideActions'] =
    currentReply?.clientSideActions
  let logs: ChatReply['logs'] = currentReply?.logs
  let nextEdgeId = null
  let lastBubbleBlockId: string | undefined = currentLastBubbleId

  let newSessionState = state

  let index = -1
  for (const block of group.blocks) {
    index++
    nextEdgeId = block.outgoingEdgeId

    if (isBubbleBlock(block)) {
      if (!block.content || (firstBubbleWasStreamed && index === 0)) continue
      messages.push(
        parseBubbleBlock(block as BubbleBlockWithDefinedContent, {
          version,
          variables: newSessionState.typebotsQueue[0].typebot.variables,
          typebotVersion: newSessionState.typebotsQueue[0].typebot.version,
        })
      )
      lastBubbleBlockId = block.id
      continue
    }

    if (isInputBlock(block))
      return {
        messages,
        input: await parseInput(newSessionState)(block),
        newSessionState: {
          ...newSessionState,
          currentBlockId: block.id,
        },
        clientSideActions,
        logs,
        visitedEdges,
      }
    const executionResponse = isLogicBlock(block)
      ? await executeLogic(newSessionState)(block)
      : isIntegrationBlock(block)
      ? await executeIntegration(newSessionState)(block)
      : null

    if (!executionResponse) continue
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
        executionResponse.clientSideActions?.find(
          (action) => action.expectsDedicatedReply
        )
      ) {
        return {
          messages,
          newSessionState: {
            ...newSessionState,
            currentBlockId: block.id,
          },
          clientSideActions,
          logs,
          visitedEdges,
        }
      }
    }

    if (executionResponse.outgoingEdgeId) {
      nextEdgeId = executionResponse.outgoingEdgeId
      break
    }
  }

  if (!nextEdgeId && newSessionState.typebotsQueue.length === 1)
    return { messages, newSessionState, clientSideActions, logs, visitedEdges }

  const nextGroup = await getNextGroup(newSessionState)(nextEdgeId ?? undefined)

  newSessionState = nextGroup.newSessionState

  if (nextGroup.visitedEdge) visitedEdges.push(nextGroup.visitedEdge)

  if (!nextGroup.group) {
    return { messages, newSessionState, clientSideActions, logs, visitedEdges }
  }

  return executeGroup(nextGroup.group, {
    version,
    state: newSessionState,
    visitedEdges,
    currentReply: {
      messages,
      clientSideActions,
      logs,
    },
    currentLastBubbleId: lastBubbleBlockId,
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
  async (block: InputBlock): Promise<ChatReply['input']> => {
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
          state.typebotsQueue[0].typebot.variables
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
      default: {
        return deepParseVariables(state.typebotsQueue[0].typebot.variables)({
          ...block,
          runtimeOptions: await computeRuntimeOptions(state)(block),
          prefilledValue: getPrefilledInputValue(
            state.typebotsQueue[0].typebot.variables
          )(block),
        })
      }
    }
  }
