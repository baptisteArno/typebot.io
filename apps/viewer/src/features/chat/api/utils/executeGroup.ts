import { deepParseVariable } from '@/features/variables'
import {
  ChatReply,
  Group,
  InputBlock,
  InputBlockType,
  RuntimeOptions,
  SessionState,
} from 'models'
import {
  isBubbleBlock,
  isDefined,
  isInputBlock,
  isIntegrationBlock,
  isLogicBlock,
} from 'utils'
import { executeLogic } from './executeLogic'
import { getNextGroup } from './getNextGroup'
import { executeIntegration } from './executeIntegration'
import { computePaymentInputRuntimeOptions } from '@/features/blocks/inputs/payment/api'

export const executeGroup =
  (state: SessionState, currentReply?: ChatReply) =>
  async (
    group: Group
  ): Promise<ChatReply & { newSessionState?: SessionState }> => {
    const messages: ChatReply['messages'] = currentReply?.messages ?? []
    let logic: ChatReply['logic'] = currentReply?.logic
    let integrations: ChatReply['integrations'] = currentReply?.integrations
    let nextEdgeId = null

    let newSessionState = state

    for (const block of group.blocks) {
      nextEdgeId = block.outgoingEdgeId

      if (isBubbleBlock(block)) {
        messages.push(
          deepParseVariable(newSessionState.typebot.variables)(block)
        )
        continue
      }

      if (isInputBlock(block))
        return {
          messages,
          input: deepParseVariable(newSessionState.typebot.variables)({
            ...block,
            runtimeOptions: await computeRuntimeOptions(newSessionState)(block),
            prefilledValue: getPrefilledInputValue(
              newSessionState.typebot.variables
            )(block),
          }),
          newSessionState: {
            ...newSessionState,
            currentBlock: {
              groupId: group.id,
              blockId: block.id,
            },
          },
        }
      const executionResponse = isLogicBlock(block)
        ? await executeLogic(newSessionState)(block)
        : isIntegrationBlock(block)
        ? await executeIntegration(newSessionState)(block)
        : null

      if (!executionResponse) continue
      if ('logic' in executionResponse && executionResponse.logic)
        logic = executionResponse.logic
      if ('integrations' in executionResponse && executionResponse.integrations)
        integrations = executionResponse.integrations
      if (executionResponse.newSessionState)
        newSessionState = executionResponse.newSessionState
      if (executionResponse.outgoingEdgeId)
        nextEdgeId = executionResponse.outgoingEdgeId
    }

    if (!nextEdgeId) return { messages, newSessionState, logic, integrations }

    const nextGroup = getNextGroup(newSessionState)(nextEdgeId)

    if (nextGroup?.updatedContext) newSessionState = nextGroup.updatedContext

    if (!nextGroup) {
      return { messages, newSessionState, logic, integrations }
    }

    return executeGroup(newSessionState, { messages, logic, integrations })(
      nextGroup.group
    )
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

const getPrefilledInputValue =
  (variables: SessionState['typebot']['variables']) => (block: InputBlock) => {
    return (
      variables.find(
        (variable) =>
          variable.id === block.options.variableId && isDefined(variable.value)
      )?.value ?? undefined
    )
  }
