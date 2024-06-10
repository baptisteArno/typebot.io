import {
  AnswerInSessionState,
  Block,
  ContinueChatResponse,
  Group,
  InputBlock,
  SessionState,
  SetVariableHistoryItem,
  Variable,
} from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import { isInputBlock } from '@typebot.io/schemas/helpers'
import { executeGroup, parseInput } from './executeGroup'
import { getNextGroup } from './getNextGroup'
import { formatEmail } from './blocks/inputs/email/formatEmail'
import { formatPhoneNumber } from './blocks/inputs/phone/formatPhoneNumber'
import { resumeWebhookExecution } from './blocks/integrations/webhook/resumeWebhookExecution'
import { saveAnswer } from './queries/saveAnswer'
import { parseButtonsReply } from './blocks/inputs/buttons/parseButtonsReply'
import { ParsedReply, Reply } from './types'
import { validateNumber } from './blocks/inputs/number/validateNumber'
import { parseDateReply } from './blocks/inputs/date/parseDateReply'
import { validateRatingReply } from './blocks/inputs/rating/validateRatingReply'
import { parsePictureChoicesReply } from './blocks/inputs/pictureChoice/parsePictureChoicesReply'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import { updateVariablesInSession } from '@typebot.io/variables/updateVariablesInSession'
import { startBotFlow } from './startBotFlow'
import { TRPCError } from '@trpc/server'
import { parseNumber } from './blocks/inputs/number/parseNumber'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { defaultPaymentInputOptions } from '@typebot.io/schemas/features/blocks/inputs/payment/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { defaultEmailInputOptions } from '@typebot.io/schemas/features/blocks/inputs/email/constants'
import { defaultChoiceInputOptions } from '@typebot.io/schemas/features/blocks/inputs/choice/constants'
import { defaultPictureChoiceOptions } from '@typebot.io/schemas/features/blocks/inputs/pictureChoice/constants'
import { defaultFileInputOptions } from '@typebot.io/schemas/features/blocks/inputs/file/constants'
import { VisitedEdge } from '@typebot.io/prisma'
import { getBlockById } from '@typebot.io/schemas/helpers'
import { ForgedBlock } from '@typebot.io/forge-repository/types'
import { forgedBlocks } from '@typebot.io/forge-repository/definitions'
import { resumeChatCompletion } from './blocks/integrations/legacy/openai/resumeChatCompletion'
import { env } from '@typebot.io/env'
import { downloadMedia } from './whatsapp/downloadMedia'
import { uploadFileToBucket } from '@typebot.io/lib/s3/uploadFileToBucket'
import { isURL } from '@typebot.io/lib/validators/isURL'
import { isForgedBlockType } from '@typebot.io/schemas/features/blocks/forged/helpers'

type Params = {
  version: 1 | 2
  state: SessionState
  startTime?: number
  textBubbleContentFormat: 'richText' | 'markdown'
}
export const continueBotFlow = async (
  reply: Reply,
  { state, version, startTime, textBubbleContentFormat }: Params
): Promise<
  ContinueChatResponse & {
    newSessionState: SessionState
    visitedEdges: VisitedEdge[]
    setVariableHistory: SetVariableHistoryItem[]
  }
> => {
  let firstBubbleWasStreamed = false
  let newSessionState = { ...state }
  const visitedEdges: VisitedEdge[] = []
  const setVariableHistory: SetVariableHistoryItem[] = []

  if (!newSessionState.currentBlockId)
    return startBotFlow({ state, version, textBubbleContentFormat })

  const { block, group, blockIndex } = getBlockById(
    newSessionState.currentBlockId,
    state.typebotsQueue[0].typebot.groups
  )

  if (!block)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Group / block not found',
    })

  let variableToUpdate: Variable | undefined

  if (block.type === LogicBlockType.SET_VARIABLE) {
    const existingVariable = state.typebotsQueue[0].typebot.variables.find(
      byId(block.options?.variableId)
    )
    if (existingVariable && reply && typeof reply === 'string') {
      variableToUpdate = {
        ...existingVariable,
      }
    }
  }
  // Legacy
  else if (
    block.type === IntegrationBlockType.OPEN_AI &&
    block.options?.task === 'Create chat completion'
  ) {
    firstBubbleWasStreamed = true
    if (reply && typeof reply === 'string') {
      const result = await resumeChatCompletion(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      })(reply)
      newSessionState = result.newSessionState
    }
  } else if (
    reply &&
    block.type === IntegrationBlockType.WEBHOOK &&
    typeof reply === 'string'
  ) {
    const result = resumeWebhookExecution({
      state,
      block,
      response: JSON.parse(reply),
    })
    if (result.newSessionState) newSessionState = result.newSessionState
  } else if (isForgedBlockType(block.type)) {
    if (reply) {
      const options = (block as ForgedBlock).options
      const action = forgedBlocks[block.type].actions.find(
        (a) => a.name === options?.action
      )
      if (action) {
        if (action.run?.stream?.getStreamVariableId) {
          firstBubbleWasStreamed = true
          variableToUpdate = state.typebotsQueue[0].typebot.variables.find(
            (v) => v.id === action?.run?.stream?.getStreamVariableId(options)
          )
        }

        if (
          action.run?.web?.displayEmbedBubble?.waitForEvent?.getSaveVariableId
        ) {
          variableToUpdate = state.typebotsQueue[0].typebot.variables.find(
            (v) =>
              v.id ===
              action?.run?.web?.displayEmbedBubble?.waitForEvent?.getSaveVariableId?.(
                options
              )
          )
        }
      }
    }
  }

  if (variableToUpdate) {
    const { newSetVariableHistory, updatedState } = updateVariablesInSession({
      state: newSessionState,
      currentBlockId: block.id,
      newVariables: [
        {
          ...variableToUpdate,
          value: safeJsonParse(reply as string),
        },
      ],
    })
    newSessionState = updatedState
    setVariableHistory.push(...newSetVariableHistory)
  }

  let formattedReply: string | undefined

  if (isInputBlock(block)) {
    const parsedReplyResult = await parseReply(newSessionState)(reply, block)

    if (parsedReplyResult.status === 'fail')
      return {
        ...(await parseRetryMessage(newSessionState)(
          block,
          textBubbleContentFormat
        )),
        newSessionState,
        visitedEdges: [],
        setVariableHistory: [],
      }

    formattedReply =
      'reply' in parsedReplyResult ? parsedReplyResult.reply : undefined
    newSessionState = await processAndSaveAnswer(state, block)(formattedReply)
  }

  const groupHasMoreBlocks = blockIndex < group.blocks.length - 1

  const { edgeId: nextEdgeId, isOffDefaultPath } = getOutgoingEdgeId(
    newSessionState
  )(block, formattedReply)

  if (groupHasMoreBlocks && !nextEdgeId) {
    const chatReply = await executeGroup(
      {
        ...group,
        blocks: group.blocks.slice(blockIndex + 1),
      } as Group,
      {
        version,
        state: newSessionState,
        visitedEdges,
        setVariableHistory,
        firstBubbleWasStreamed,
        startTime,
        textBubbleContentFormat,
      }
    )
    return {
      ...chatReply,
      lastMessageNewFormat:
        formattedReply !== reply ? formattedReply : undefined,
    }
  }

  if (!nextEdgeId && state.typebotsQueue.length === 1)
    return {
      messages: [],
      newSessionState,
      lastMessageNewFormat:
        formattedReply !== reply ? formattedReply : undefined,
      visitedEdges,
      setVariableHistory,
    }

  const nextGroup = await getNextGroup({
    state: newSessionState,
    edgeId: nextEdgeId,
    isOffDefaultPath,
  })

  if (nextGroup.visitedEdge) visitedEdges.push(nextGroup.visitedEdge)

  newSessionState = nextGroup.newSessionState

  if (!nextGroup.group)
    return {
      messages: [],
      newSessionState,
      lastMessageNewFormat:
        formattedReply !== reply ? formattedReply : undefined,
      visitedEdges,
      setVariableHistory,
    }

  const chatReply = await executeGroup(nextGroup.group, {
    version,
    state: newSessionState,
    firstBubbleWasStreamed,
    visitedEdges,
    setVariableHistory,
    startTime,
    textBubbleContentFormat,
  })

  return {
    ...chatReply,
    lastMessageNewFormat: formattedReply !== reply ? formattedReply : undefined,
  }
}

const processAndSaveAnswer =
  (state: SessionState, block: InputBlock) =>
  async (reply: string | undefined): Promise<SessionState> => {
    if (!reply) return state
    let newState = await saveAnswerInDb(state, block)(reply)
    return newState
  }

const saveVariableValueIfAny =
  (state: SessionState, block: InputBlock) =>
  (reply: string): SessionState => {
    if (!block.options?.variableId) return state
    const foundVariable = state.typebotsQueue[0].typebot.variables.find(
      (variable) => variable.id === block.options?.variableId
    )
    if (!foundVariable) return state

    const { updatedState } = updateVariablesInSession({
      newVariables: [
        {
          ...foundVariable,
          value: Array.isArray(foundVariable.value)
            ? foundVariable.value.concat(reply)
            : reply,
        },
      ],
      currentBlockId: undefined,
      state,
    })

    return updatedState
  }

const parseRetryMessage =
  (state: SessionState) =>
  async (
    block: InputBlock,
    textBubbleContentFormat: 'richText' | 'markdown'
  ): Promise<Pick<ContinueChatResponse, 'messages' | 'input'>> => {
    const retryMessage =
      block.options &&
      'retryMessageContent' in block.options &&
      block.options.retryMessageContent
        ? parseVariables(state.typebotsQueue[0].typebot.variables)(
            block.options.retryMessageContent
          )
        : parseDefaultRetryMessage(block)
    return {
      messages: [
        {
          id: block.id,
          type: BubbleBlockType.TEXT,
          content:
            textBubbleContentFormat === 'richText'
              ? {
                  type: 'richText',
                  richText: [{ type: 'p', children: [{ text: retryMessage }] }],
                }
              : {
                  type: 'markdown',
                  markdown: retryMessage,
                },
        },
      ],
      input: await parseInput(state)(block),
    }
  }

const parseDefaultRetryMessage = (block: InputBlock): string => {
  switch (block.type) {
    case InputBlockType.EMAIL:
      return defaultEmailInputOptions.retryMessageContent
    case InputBlockType.PAYMENT:
      return defaultPaymentInputOptions.retryMessageContent
    default:
      return 'Invalid message. Please, try again.'
  }
}

const saveAnswerInDb =
  (state: SessionState, block: InputBlock) =>
  async (reply: string): Promise<SessionState> => {
    let newSessionState = state
    await saveAnswer({
      answer: {
        blockId: block.id,
        content: reply,
      },
      reply,
      state,
    })

    newSessionState = {
      ...saveVariableValueIfAny(newSessionState, block)(reply),
      previewMetadata: state.typebotsQueue[0].resultId
        ? newSessionState.previewMetadata
        : {
            ...newSessionState.previewMetadata,
            answers: (newSessionState.previewMetadata?.answers ?? []).concat({
              blockId: block.id,
              content: reply,
            }),
          },
    }

    const key = block.options?.variableId
      ? newSessionState.typebotsQueue[0].typebot.variables.find(
          (variable) => variable.id === block.options?.variableId
        )?.name
      : parseGroupKey(block.id, { state: newSessionState })

    return setNewAnswerInState(newSessionState)({
      key: key ?? block.id,
      value: reply,
    })
  }

const parseGroupKey = (blockId: string, { state }: { state: SessionState }) => {
  const group = state.typebotsQueue[0].typebot.groups.find((group) =>
    group.blocks.find((b) => b.id === blockId)
  )
  if (!group) return

  const inputBlockNumber = group.blocks
    .filter(isInputBlock)
    .findIndex((b) => b.id === blockId)

  return inputBlockNumber > 0
    ? `${group.title} (${inputBlockNumber})`
    : group?.title
}

const setNewAnswerInState =
  (state: SessionState) => (newAnswer: AnswerInSessionState) => {
    const answers = state.typebotsQueue[0].answers
    const newAnswers = answers
      .filter((answer) => answer.key !== newAnswer.key)
      .concat(newAnswer)

    return {
      ...state,
      progressMetadata: state.progressMetadata
        ? { totalAnswers: state.progressMetadata.totalAnswers + 1 }
        : undefined,
      typebotsQueue: state.typebotsQueue.map((typebot, index) =>
        index === 0
          ? {
              ...typebot,
              answers: newAnswers,
            }
          : typebot
      ),
    } satisfies SessionState
  }

const getOutgoingEdgeId =
  (state: Pick<SessionState, 'typebotsQueue'>) =>
  (
    block: Block,
    reply: string | undefined
  ): { edgeId: string | undefined; isOffDefaultPath: boolean } => {
    const variables = state.typebotsQueue[0].typebot.variables
    if (
      block.type === InputBlockType.CHOICE &&
      !(
        block.options?.isMultipleChoice ??
        defaultChoiceInputOptions.isMultipleChoice
      ) &&
      reply
    ) {
      const matchedItem = block.items.find(
        (item) =>
          parseVariables(variables)(item.content).normalize() ===
          reply.normalize()
      )
      if (matchedItem?.outgoingEdgeId)
        return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true }
    }
    if (
      block.type === InputBlockType.PICTURE_CHOICE &&
      !(
        block.options?.isMultipleChoice ??
        defaultPictureChoiceOptions.isMultipleChoice
      ) &&
      reply
    ) {
      const matchedItem = block.items.find(
        (item) =>
          parseVariables(variables)(item.title).normalize() ===
          reply.normalize()
      )
      if (matchedItem?.outgoingEdgeId)
        return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true }
    }
    return { edgeId: block.outgoingEdgeId, isOffDefaultPath: false }
  }

const parseReply =
  (state: SessionState) =>
  async (reply: Reply, block: InputBlock): Promise<ParsedReply> => {
    if (reply && typeof reply !== 'string') {
      if (block.type !== InputBlockType.FILE) return { status: 'fail' }
      if (block.options?.visibility !== 'Public') {
        return {
          status: 'success',
          reply:
            env.NEXTAUTH_URL +
            `/api/typebots/${state.typebotsQueue[0].typebot.id}/whatsapp/media/${reply.mediaId}`,
        }
      }
      const { file, mimeType } = await downloadMedia({
        mediaId: reply.mediaId,
        systemUserAccessToken: reply.accessToken,
      })
      const url = await uploadFileToBucket({
        file,
        key: `public/workspaces/${reply.workspaceId}/typebots/${state.typebotsQueue[0].typebot.id}/results/${state.typebotsQueue[0].resultId}/${reply.mediaId}`,
        mimeType,
      })
      return {
        status: 'success',
        reply: url,
      }
    }
    switch (block.type) {
      case InputBlockType.EMAIL: {
        if (!reply) return { status: 'fail' }
        const formattedEmail = formatEmail(reply)
        if (!formattedEmail) return { status: 'fail' }
        return { status: 'success', reply: formattedEmail }
      }
      case InputBlockType.PHONE: {
        if (!reply) return { status: 'fail' }
        const formattedPhone = formatPhoneNumber(
          reply,
          block.options?.defaultCountryCode
        )
        if (!formattedPhone) return { status: 'fail' }
        return { status: 'success', reply: formattedPhone }
      }
      case InputBlockType.URL: {
        if (!reply) return { status: 'fail' }
        const isValid = isURL(reply, { require_protocol: false })
        if (!isValid) return { status: 'fail' }
        return { status: 'success', reply: reply }
      }
      case InputBlockType.CHOICE: {
        if (!reply) return { status: 'fail' }
        return parseButtonsReply(state)(reply, block)
      }
      case InputBlockType.NUMBER: {
        if (!reply) return { status: 'fail' }
        const isValid = validateNumber(reply, {
          options: block.options,
          variables: state.typebotsQueue[0].typebot.variables,
        })
        if (!isValid) return { status: 'fail' }
        return { status: 'success', reply: parseNumber(reply) }
      }
      case InputBlockType.DATE: {
        if (!reply) return { status: 'fail' }
        return parseDateReply(reply, block)
      }
      case InputBlockType.FILE: {
        if (!reply)
          return block.options?.isRequired ?? defaultFileInputOptions.isRequired
            ? { status: 'fail' }
            : { status: 'skip' }
        const urls = reply.split(', ')
        const status = urls.some((url) =>
          isURL(url, { require_tld: env.S3_ENDPOINT !== 'localhost' })
        )
          ? 'success'
          : 'fail'
        return { status, reply: reply }
      }
      case InputBlockType.PAYMENT: {
        if (!reply) return { status: 'fail' }
        if (reply === 'fail') return { status: 'fail' }
        return { status: 'success', reply: reply }
      }
      case InputBlockType.RATING: {
        if (!reply) return { status: 'fail' }
        const isValid = validateRatingReply(reply, block)
        if (!isValid) return { status: 'fail' }
        return { status: 'success', reply: reply }
      }
      case InputBlockType.PICTURE_CHOICE: {
        if (!reply) return { status: 'fail' }
        return parsePictureChoicesReply(state)(reply, block)
      }
      case InputBlockType.TEXT: {
        if (!reply) return { status: 'fail' }
        return { status: 'success', reply: reply }
      }
    }
  }

export const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
