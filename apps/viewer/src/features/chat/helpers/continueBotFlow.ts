import { TRPCError } from '@trpc/server'
import {
  Block,
  BlockType,
  BubbleBlockType,
  ChatReply,
  InputBlock,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
  ResultInSession,
  SessionState,
  SetVariableBlock,
  WebhookBlock,
} from '@typebot.io/schemas'
import { isInputBlock, byId } from '@typebot.io/lib'
import { executeGroup } from './executeGroup'
import { getNextGroup } from './getNextGroup'
import { validateEmail } from '@/features/blocks/inputs/email/validateEmail'
import { formatPhoneNumber } from '@/features/blocks/inputs/phone/formatPhoneNumber'
import { validatePhoneNumber } from '@/features/blocks/inputs/phone/validatePhoneNumber'
import { validateUrl } from '@/features/blocks/inputs/url/validateUrl'
import { updateVariables } from '@/features/variables/updateVariables'
import { parseVariables } from '@/features/variables/parseVariables'
import { OpenAIBlock } from '@typebot.io/schemas/features/blocks/integrations/openai'
import { resumeChatCompletion } from '@/features/blocks/integrations/openai/resumeChatCompletion'
import { resumeWebhookExecution } from '@/features/blocks/integrations/webhook/resumeWebhookExecution'
import { upsertAnswer } from '../queries/upsertAnswer'

export const continueBotFlow =
  (state: SessionState) =>
  async (
    reply?: string
  ): Promise<ChatReply & { newSessionState?: SessionState }> => {
    let newSessionState = { ...state }
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

    if (block.type === LogicBlockType.SET_VARIABLE) {
      const existingVariable = state.typebot.variables.find(
        byId(block.options.variableId)
      )
      if (existingVariable) {
        const newVariable = {
          ...existingVariable,
          value: reply,
        }
        newSessionState = updateVariables(state)([newVariable])
      }
    } else if (reply && block.type === IntegrationBlockType.WEBHOOK) {
      const result = resumeWebhookExecution({
        state,
        block,
        response: JSON.parse(reply),
      })
      if (result.newSessionState) newSessionState = result.newSessionState
    } else if (
      block.type === IntegrationBlockType.OPEN_AI &&
      block.options.task === 'Create chat completion'
    ) {
      if (reply) {
        const result = await resumeChatCompletion(state, {
          options: block.options,
          outgoingEdgeId: block.outgoingEdgeId,
        })(reply)
        newSessionState = result.newSessionState
      }
    } else if (!isInputBlock(block))
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Current block is not an input block',
      })

    let formattedReply = null

    if (isInputBlock(block)) {
      if (reply && !isReplyValid(reply, block)) return parseRetryMessage(block)

      formattedReply = formatReply(reply, block.type)

      if (!formattedReply && !canSkip(block.type)) {
        return parseRetryMessage(block)
      }

      const nextEdgeId = getOutgoingEdgeId(newSessionState)(
        block,
        formattedReply
      )
      const itemId = nextEdgeId
        ? state.typebot.edges.find(byId(nextEdgeId))?.from.itemId
        : undefined
      newSessionState = await processAndSaveAnswer(
        state,
        block,
        itemId
      )(formattedReply)
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
  (state: SessionState, block: InputBlock, itemId?: string) =>
  async (reply: string | null): Promise<SessionState> => {
    if (!reply) return state
    let newState = await saveAnswer(state, block, itemId)(reply)
    newState = saveVariableValueIfAny(newState, block)(reply)
    return newState
  }

const saveVariableValueIfAny =
  (state: SessionState, block: InputBlock) =>
  (reply: string): SessionState => {
    if (!block.options.variableId) return state
    const foundVariable = state.typebot.variables.find(
      (variable) => variable.id === block.options.variableId
    )
    if (!foundVariable) return state

    const newSessionState = updateVariables(state)([
      {
        ...foundVariable,
        value: Array.isArray(foundVariable.value)
          ? foundVariable.value.concat(reply)
          : reply,
      },
    ])

    return newSessionState
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
        id: block.id,
        type: BubbleBlockType.TEXT,
        content: {
          richText: [{ type: 'p', children: [{ text: retryMessage }] }],
        },
      },
    ],
    input: block,
  }
}

const saveAnswer =
  (state: SessionState, block: InputBlock, itemId?: string) =>
  async (reply: string): Promise<SessionState> => {
    await upsertAnswer({
      block,
      answer: {
        blockId: block.id,
        itemId,
        groupId: block.groupId,
        content: reply,
        variableId: block.options.variableId,
        storageUsed: 0,
      },
      reply,
      state,
      itemId,
    })

    return setNewAnswerInState(state)({
      blockId: block.id,
      variableId: block.options.variableId ?? null,
      content: reply,
    })
  }

const setNewAnswerInState =
  (state: SessionState) => (newAnswer: ResultInSession['answers'][number]) => {
    const newAnswers = state.result.answers
      .filter((answer) => answer.blockId !== newAnswer.blockId)
      .concat(newAnswer)

    return {
      ...state,
      result: {
        ...state.result,
        answers: newAnswers,
      },
    } satisfies SessionState
  }

const getOutgoingEdgeId =
  ({ typebot: { variables } }: Pick<SessionState, 'typebot'>) =>
  (
    block: InputBlock | SetVariableBlock | OpenAIBlock | WebhookBlock,
    reply: string | null
  ) => {
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
    if (
      block.type === InputBlockType.PICTURE_CHOICE &&
      !block.options.isMultipleChoice &&
      reply
    ) {
      const matchedItem = block.items.find(
        (item) => parseVariables(variables)(item.title) === reply
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
  }
  return true
}

export const canSkip = (inputType: InputBlockType) =>
  inputType === InputBlockType.FILE
