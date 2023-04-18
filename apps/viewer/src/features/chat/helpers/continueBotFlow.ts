import prisma from '@/lib/prisma'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@typebot.io/prisma'
import got from 'got'
import {
  Block,
  BlockType,
  BubbleBlockType,
  ChatReply,
  InputBlock,
  InputBlockType,
  LogicBlockType,
  ResultInSession,
  SessionState,
  SetVariableBlock,
} from '@typebot.io/schemas'
import { isInputBlock, isNotDefined, byId } from '@typebot.io/lib'
import { executeGroup } from './executeGroup'
import { getNextGroup } from './getNextGroup'
import { validateEmail } from '@/features/blocks/inputs/email/validateEmail'
import { formatPhoneNumber } from '@/features/blocks/inputs/phone/formatPhoneNumber'
import { validatePhoneNumber } from '@/features/blocks/inputs/phone/validatePhoneNumber'
import { validateUrl } from '@/features/blocks/inputs/url/validateUrl'
import { updateVariables } from '@/features/variables/updateVariables'
import { parseVariables } from '@/features/variables/parseVariables'

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
        newSessionState = await updateVariables(state)([newVariable])
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

      newSessionState = await processAndSaveAnswer(state, block)(formattedReply)
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
  (state: SessionState, block: InputBlock) =>
  async (reply: string | null): Promise<SessionState> => {
    if (!reply) return state
    let newState = await saveAnswer(state, block)(reply)
    newState = await saveVariableValueIfAny(newState, block)(reply)
    return newState
  }

const saveVariableValueIfAny =
  (state: SessionState, block: InputBlock) =>
  async (reply: string): Promise<SessionState> => {
    if (!block.options.variableId) return state
    const foundVariable = state.typebot.variables.find(
      (variable) => variable.id === block.options.variableId
    )
    if (!foundVariable) return state

    const newSessionState = await updateVariables(state)([
      {
        ...foundVariable,
        value: Array.isArray(foundVariable.value)
          ? foundVariable.value.concat(reply)
          : reply,
      },
    ])

    return newSessionState
  }

export const setResultAsCompleted = async (resultId: string) => {
  await prisma.result.update({
    where: { id: resultId },
    data: { isCompleted: true },
  })
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
  (state: SessionState, block: InputBlock) =>
  async (reply: string): Promise<SessionState> => {
    const resultId = state.result?.id
    const answer = {
      resultId,
      blockId: block.id,
      groupId: block.groupId,
      content: reply,
      variableId: block.options.variableId,
      storageUsed: 0,
    }
    if (state.result.answers.length === 0 && state.result.id)
      await setResultAsStarted(state.result.id)

    const newSessionState = setNewAnswerInState(state)({
      blockId: block.id,
      variableId: block.options.variableId ?? null,
      content: reply,
    })

    if (resultId) {
      if (reply.includes('http') && block.type === InputBlockType.FILE) {
        answer.storageUsed = await computeStorageUsed(reply)
      }
      await prisma.answer.upsert({
        where: {
          resultId_blockId_groupId: {
            resultId,
            groupId: block.groupId,
            blockId: block.id,
          },
        },
        create: answer as Prisma.AnswerUncheckedCreateInput,
        update: answer,
      })
    }

    return newSessionState
  }

const setResultAsStarted = async (resultId: string) => {
  await prisma.result.update({
    where: { id: resultId },
    data: { hasStarted: true },
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

const computeStorageUsed = async (reply: string) => {
  let storageUsed = 0
  const fileUrls = reply.split(', ')
  const hasReachedStorageLimit = fileUrls[0] === null
  if (!hasReachedStorageLimit) {
    for (const url of fileUrls) {
      const { headers } = await got(url)
      const size = headers['content-length']
      if (isNotDefined(size)) continue
      storageUsed += parseInt(size, 10)
    }
  }
  return storageUsed
}

const getOutgoingEdgeId =
  ({ typebot: { variables } }: Pick<SessionState, 'typebot'>) =>
  (block: InputBlock | SetVariableBlock, reply: string | null) => {
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
  }
  return true
}

export const canSkip = (inputType: InputBlockType) =>
  inputType === InputBlockType.FILE
