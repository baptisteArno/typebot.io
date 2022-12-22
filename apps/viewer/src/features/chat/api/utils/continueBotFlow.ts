import { validateButtonInput } from '@/features/blocks/inputs/buttons/api'
import { validateEmail } from '@/features/blocks/inputs/email/api'
import {
  formatPhoneNumber,
  validatePhoneNumber,
} from '@/features/blocks/inputs/phone/api'
import { validateUrl } from '@/features/blocks/inputs/url/api'
import { parseVariables } from '@/features/variables'
import prisma from '@/lib/prisma'
import { TRPCError } from '@trpc/server'
import {
  Block,
  BlockType,
  BubbleBlockType,
  ChatReply,
  InputBlock,
  InputBlockType,
  SessionState,
  Variable,
} from 'models'
import { isInputBlock } from 'utils'
import { executeGroup } from './executeGroup'
import { getNextGroup } from './getNextGroup'

export const continueBotFlow =
  (state: SessionState) =>
  async (
    reply?: string
  ): Promise<ChatReply & { newSessionState?: SessionState }> => {
    const group = state.typebot.groups.find(
      (group) => group.id === state.currentBlock?.groupId
    )
    const blockIndex =
      group?.blocks.findIndex(
        (block) => block.id === state.currentBlock?.blockId
      ) ?? -1

    const block = blockIndex >= 0 ? group?.blocks[blockIndex ?? 0] : null

    if (!block || !group)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Current block not found',
      })

    if (!isInputBlock(block))
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Current block is not an input block',
      })

    const formattedReply = formatReply(reply, block.type)

    if (!formattedReply || !isReplyValid(formattedReply, block))
      return parseRetryMessage(block)

    const newVariables = await processAndSaveAnswer(
      state,
      block
    )(formattedReply)

    const newSessionState = {
      ...state,
      typebot: {
        ...state.typebot,
        variables: newVariables,
      },
    }

    const groupHasMoreBlocks = blockIndex < group.blocks.length - 1

    const nextEdgeId = getOutgoingEdgeId(newSessionState)(block, formattedReply)

    if (groupHasMoreBlocks && !nextEdgeId) {
      return executeGroup(newSessionState)({
        ...group,
        blocks: group.blocks.slice(blockIndex + 1),
      })
    }

    if (!nextEdgeId && state.linkedTypebots.queue.length === 0)
      return { messages: [] }

    const nextGroup = getNextGroup(newSessionState)(nextEdgeId)

    if (!nextGroup) return { messages: [] }

    return executeGroup(newSessionState)(nextGroup.group)
  }

const processAndSaveAnswer =
  (state: Pick<SessionState, 'result' | 'typebot'>, block: InputBlock) =>
  async (reply: string): Promise<Variable[]> => {
    state.result && (await saveAnswer(state.result.id, block)(reply))
    const newVariables = saveVariableValueIfAny(state, block)(reply)
    return newVariables
  }

const saveVariableValueIfAny =
  (state: Pick<SessionState, 'result' | 'typebot'>, block: InputBlock) =>
  (reply: string): Variable[] => {
    if (!block.options.variableId) return state.typebot.variables
    const variable = state.typebot.variables.find(
      (variable) => variable.id === block.options.variableId
    )
    if (!variable) return state.typebot.variables

    return [
      ...state.typebot.variables.filter(
        (variable) => variable.id !== block.options.variableId
      ),
      {
        ...variable,
        value: reply,
      },
    ]
  }

const parseRetryMessage = (
  block: InputBlock
): Pick<ChatReply, 'messages' | 'input'> => {
  const retryMessage =
    'retryMessageContent' in block.options && block.options.retryMessageContent
      ? block.options.retryMessageContent
      : 'Invalid message. Please, try again.'
  return {
    messages: [
      {
        type: BubbleBlockType.TEXT,
        content: {
          plainText: retryMessage,
          html: `<div>${retryMessage}</div>`,
        },
      },
    ],
    input: block,
  }
}

const saveAnswer =
  (resultId: string, block: InputBlock) => async (reply: string) => {
    await prisma.answer.create({
      data: {
        resultId: resultId,
        blockId: block.id,
        groupId: block.groupId,
        content: reply,
        variableId: block.options.variableId,
      },
    })
  }

const getOutgoingEdgeId =
  ({ typebot: { variables } }: Pick<SessionState, 'typebot'>) =>
  (block: InputBlock, reply?: string) => {
    if (
      block.type === InputBlockType.CHOICE &&
      !block.options.isMultipleChoice &&
      reply
    ) {
      const matchedItem = block.items.find(
        (item) => parseVariables(variables)(item.content) === reply
      )
      if (matchedItem?.outgoingEdgeId) return matchedItem.outgoingEdgeId
    }
    return block.outgoingEdgeId
  }

export const formatReply = (
  inputValue: string | undefined,
  blockType: BlockType
): string | null => {
  if (!inputValue) return null
  switch (blockType) {
    case InputBlockType.PHONE:
      return formatPhoneNumber(inputValue)
  }
  return inputValue
}

export const isReplyValid = (inputValue: string, block: Block): boolean => {
  switch (block.type) {
    case InputBlockType.EMAIL:
      return validateEmail(inputValue)
    case InputBlockType.PHONE:
      return validatePhoneNumber(inputValue)
    case InputBlockType.URL:
      return validateUrl(inputValue)
    case InputBlockType.CHOICE:
      return validateButtonInput(block, inputValue)
  }
  return true
}
