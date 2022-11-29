import { parseVariables } from '@/features/variables'
import {
  BubbleBlock,
  BubbleBlockType,
  ChatMessageContent,
  ChatReply,
  Group,
  SessionState,
} from 'models'
import {
  isBubbleBlock,
  isInputBlock,
  isIntegrationBlock,
  isLogicBlock,
} from 'utils'
import { executeLogic } from './executeLogic'
import { getNextGroup } from './getNextGroup'
import { executeIntegration } from './executeIntegration'

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
        messages.push({
          type: block.type,
          content: parseBubbleBlockContent(newSessionState)(block),
        })
        continue
      }

      if (isInputBlock(block))
        return {
          messages,
          input: block,
          newSessionState: {
            ...newSessionState,
            currentBlock: {
              groupId: group.id,
              blockId: block.id,
            },
          },
        }
      const executionResponse = isLogicBlock(block)
        ? await executeLogic(state)(block)
        : isIntegrationBlock(block)
        ? await executeIntegration(state)(block)
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

const parseBubbleBlockContent =
  ({ typebot: { variables } }: SessionState) =>
  (block: BubbleBlock): ChatMessageContent => {
    switch (block.type) {
      case BubbleBlockType.TEXT: {
        const plainText = parseVariables(variables)(block.content.plainText)
        const html = parseVariables(variables)(block.content.html)
        return { plainText, html }
      }
      case BubbleBlockType.IMAGE: {
        const url = parseVariables(variables)(block.content.url)
        return { url }
      }
      case BubbleBlockType.VIDEO: {
        const url = parseVariables(variables)(block.content.url)
        return { url }
      }
      case BubbleBlockType.AUDIO: {
        const url = parseVariables(variables)(block.content.url)
        return { url }
      }
      case BubbleBlockType.EMBED: {
        const url = parseVariables(variables)(block.content.url)
        return { url }
      }
    }
  }
