import {
  Answer,
  ContinueChatResponse,
  Edge,
  Group,
  InputBlock,
  SniperInSession,
  Variable,
} from '@sniper.io/schemas'
import { SetVariableHistoryItem } from '@sniper.io/schemas/features/result'
import { isBubbleBlock, isInputBlock } from '@sniper.io/schemas/helpers'
import { BubbleBlockType } from '@sniper.io/schemas/features/blocks/bubbles/constants'
import { convertRichTextToMarkdown } from '@sniper.io/lib/markdown/convertRichTextToMarkdown'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'
import { createId } from '@sniper.io/lib/createId'
import { executeCondition } from './executeCondition'
import {
  parseBubbleBlock,
  BubbleBlockWithDefinedContent,
} from '../bot-engine/parseBubbleBlock'
import { defaultChoiceInputOptions } from '@sniper.io/schemas/features/blocks/inputs/choice/constants'
import { defaultPictureChoiceOptions } from '@sniper.io/schemas/features/blocks/inputs/pictureChoice/constants'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { parseVariables } from '@sniper.io/variables/parseVariables'

type TranscriptMessage =
  | {
      role: 'bot' | 'user'
    } & (
      | { type: 'text'; text: string }
      | { type: 'image'; image: string }
      | { type: 'video'; video: string }
      | { type: 'audio'; audio: string }
    )

export const parseTranscriptMessageText = (
  message: TranscriptMessage
): string => {
  switch (message.type) {
    case 'text':
      return message.text
    case 'image':
      return message.image
    case 'video':
      return message.video
    case 'audio':
      return message.audio
  }
}

export const computeResultTranscript = ({
  sniper,
  answers,
  setVariableHistory,
  visitedEdges,
  stopAtBlockId,
}: {
  sniper: SniperInSession
  answers: Pick<Answer, 'blockId' | 'content'>[]
  setVariableHistory: Pick<
    SetVariableHistoryItem,
    'blockId' | 'variableId' | 'value'
  >[]
  visitedEdges: string[]
  stopAtBlockId?: string
}): TranscriptMessage[] => {
  const firstEdgeId = getFirstEdgeId(sniper)
  if (!firstEdgeId) return []
  const firstEdge = sniper.edges.find((edge) => edge.id === firstEdgeId)
  if (!firstEdge) return []
  const firstGroup = getNextGroup(sniper, firstEdgeId)
  if (!firstGroup) return []
  return executeGroup({
    snipersQueue: [{ sniper }],
    nextGroup: firstGroup,
    currentTranscript: [],
    answers,
    setVariableHistory,
    visitedEdges,
    stopAtBlockId,
  })
}

const getFirstEdgeId = (sniper: SniperInSession) => {
  if (sniper.version === '6') return sniper.events?.[0].outgoingEdgeId
  return sniper.groups.at(0)?.blocks.at(0)?.outgoingEdgeId
}

const getNextGroup = (
  sniper: SniperInSession,
  edgeId: string
): { group: Group; blockIndex?: number } | undefined => {
  const edge = sniper.edges.find((edge) => edge.id === edgeId)
  if (!edge) return
  const group = sniper.groups.find((group) => group.id === edge.to.groupId)
  if (!group) return
  const blockIndex = edge.to.blockId
    ? group.blocks.findIndex((block) => block.id === edge.to.blockId)
    : undefined
  return { group, blockIndex }
}

const executeGroup = ({
  currentTranscript,
  snipersQueue,
  answers,
  nextGroup,
  setVariableHistory,
  visitedEdges,
  stopAtBlockId,
}: {
  currentTranscript: TranscriptMessage[]
  nextGroup:
    | {
        group: Group
        blockIndex?: number | undefined
      }
    | undefined
  snipersQueue: {
    sniper: SniperInSession
    resumeEdgeId?: string
  }[]
  answers: Pick<Answer, 'blockId' | 'content'>[]
  setVariableHistory: Pick<
    SetVariableHistoryItem,
    'blockId' | 'variableId' | 'value'
  >[]
  visitedEdges: string[]
  stopAtBlockId?: string
}): TranscriptMessage[] => {
  if (!nextGroup) return currentTranscript
  for (const block of nextGroup?.group.blocks.slice(
    nextGroup.blockIndex ?? 0
  )) {
    if (stopAtBlockId && block.id === stopAtBlockId) return currentTranscript
    if (setVariableHistory.at(0)?.blockId === block.id)
      snipersQueue[0].sniper.variables = applySetVariable(
        setVariableHistory.shift(),
        snipersQueue[0].sniper
      )
    let nextEdgeId = block.outgoingEdgeId
    if (isBubbleBlock(block)) {
      if (!block.content) continue
      const parsedBubbleBlock = parseBubbleBlock(
        block as BubbleBlockWithDefinedContent,
        {
          version: 2,
          variables: snipersQueue[0].sniper.variables,
          sniperVersion: snipersQueue[0].sniper.version,
          textBubbleContentFormat: 'markdown',
        }
      )
      const newMessage =
        convertChatMessageToTranscriptMessage(parsedBubbleBlock)
      if (newMessage) currentTranscript.push(newMessage)
    } else if (isInputBlock(block)) {
      const answer = answers.shift()
      if (!answer) break
      if (block.options?.variableId) {
        const variable = snipersQueue[0].sniper.variables.find(
          (variable) => variable.id === block.options?.variableId
        )
        if (variable) {
          snipersQueue[0].sniper.variables =
            snipersQueue[0].sniper.variables.map((v) =>
              v.id === variable.id ? { ...v, value: answer.content } : v
            )
        }
      }
      currentTranscript.push({
        role: 'user',
        type: 'text',
        text: answer.content,
      })
      const outgoingEdge = getOutgoingEdgeId({
        block,
        answer: answer.content,
        variables: snipersQueue[0].sniper.variables,
      })
      if (outgoingEdge.isOffDefaultPath) visitedEdges.shift()
      nextEdgeId = outgoingEdge.edgeId
    } else if (block.type === LogicBlockType.CONDITION) {
      const passedCondition = block.items.find(
        (item) =>
          item.content &&
          executeCondition({
            variables: snipersQueue[0].sniper.variables,
            condition: item.content,
          })
      )
      if (passedCondition) {
        visitedEdges.shift()
        nextEdgeId = passedCondition.outgoingEdgeId
      }
    } else if (block.type === LogicBlockType.AB_TEST) {
      nextEdgeId = visitedEdges.shift() ?? nextEdgeId
    } else if (block.type === LogicBlockType.JUMP) {
      if (!block.options?.groupId) continue
      const groupToJumpTo = snipersQueue[0].sniper.groups.find(
        (group) => group.id === block.options?.groupId
      )
      const blockToJumpTo =
        groupToJumpTo?.blocks.find((b) => b.id === block.options?.blockId) ??
        groupToJumpTo?.blocks[0]

      if (!blockToJumpTo) continue

      const portalEdge = {
        id: createId(),
        from: { blockId: '', groupId: '' },
        to: { groupId: block.options.groupId, blockId: blockToJumpTo.id },
      }
      snipersQueue[0].sniper.edges.push(portalEdge)
      visitedEdges.shift()
      nextEdgeId = portalEdge.id
    } else if (block.type === LogicBlockType.SNIPER_LINK) {
      const isLinkingSameSniper =
        block.options &&
        (block.options.sniperId === 'current' ||
          block.options.sniperId === snipersQueue[0].sniper.id)

      const linkedGroup = snipersQueue[0].sniper.groups.find(
        (g) => g.id === block.options?.groupId
      )
      if (!isLinkingSameSniper || !linkedGroup) continue
      let resumeEdge: Edge | undefined
      if (!block.outgoingEdgeId) {
        const currentBlockIndex = nextGroup.group.blocks.findIndex(
          (b) => b.id === block.id
        )
        const nextBlockInGroup =
          currentBlockIndex === -1
            ? undefined
            : nextGroup.group.blocks.at(currentBlockIndex + 1)
        if (nextBlockInGroup)
          resumeEdge = {
            id: createId(),
            from: {
              blockId: '',
            },
            to: {
              groupId: nextGroup.group.id,
              blockId: nextBlockInGroup.id,
            },
          }
      }
      return executeGroup({
        snipersQueue: [
          {
            sniper: snipersQueue[0].sniper,
            resumeEdgeId: resumeEdge ? resumeEdge.id : block.outgoingEdgeId,
          },
          {
            sniper: resumeEdge
              ? {
                  ...snipersQueue[0].sniper,
                  edges: snipersQueue[0].sniper.edges.concat([resumeEdge]),
                }
              : snipersQueue[0].sniper,
          },
        ],
        answers,
        setVariableHistory,
        currentTranscript,
        nextGroup: {
          group: linkedGroup,
        },
        visitedEdges,
        stopAtBlockId,
      })
    }
    if (nextEdgeId) {
      const nextGroup = getNextGroup(snipersQueue[0].sniper, nextEdgeId)
      if (nextGroup) {
        return executeGroup({
          snipersQueue,
          answers,
          setVariableHistory,
          currentTranscript,
          nextGroup,
          visitedEdges,
          stopAtBlockId,
        })
      }
    }
  }
  if (snipersQueue.length > 1 && snipersQueue[0].resumeEdgeId) {
    return executeGroup({
      snipersQueue: snipersQueue.slice(1),
      answers,
      setVariableHistory,
      currentTranscript,
      nextGroup: getNextGroup(
        snipersQueue[1].sniper,
        snipersQueue[0].resumeEdgeId
      ),
      visitedEdges: visitedEdges.slice(1),
      stopAtBlockId,
    })
  }
  return currentTranscript
}

const applySetVariable = (
  setVariable:
    | Pick<SetVariableHistoryItem, 'blockId' | 'variableId' | 'value'>
    | undefined,
  sniper: SniperInSession
): Variable[] => {
  if (!setVariable) return sniper.variables
  const variable = sniper.variables.find(
    (variable) => variable.id === setVariable.variableId
  )
  if (!variable) return sniper.variables
  return sniper.variables.map((v) =>
    v.id === variable.id ? { ...v, value: setVariable.value } : v
  )
}

const convertChatMessageToTranscriptMessage = (
  chatMessage: ContinueChatResponse['messages'][0]
): TranscriptMessage | null => {
  switch (chatMessage.type) {
    case BubbleBlockType.TEXT: {
      if (chatMessage.content.type === 'richText') return null
      return {
        role: 'bot',
        type: 'text',
        text: chatMessage.content.markdown,
      }
    }
    case BubbleBlockType.IMAGE: {
      if (!chatMessage.content.url) return null
      return {
        role: 'bot',
        type: 'image',
        image: chatMessage.content.url,
      }
    }
    case BubbleBlockType.VIDEO: {
      if (!chatMessage.content.url) return null
      return {
        role: 'bot',
        type: 'video',
        video: chatMessage.content.url,
      }
    }
    case BubbleBlockType.AUDIO: {
      if (!chatMessage.content.url) return null
      return {
        role: 'bot',
        type: 'audio',
        audio: chatMessage.content.url,
      }
    }
    case 'custom-embed':
    case BubbleBlockType.EMBED: {
      return null
    }
  }
}

const getOutgoingEdgeId = ({
  block,
  answer,
  variables,
}: {
  block: InputBlock
  answer: string | undefined
  variables: Variable[]
}): { edgeId: string | undefined; isOffDefaultPath: boolean } => {
  if (
    block.type === InputBlockType.CHOICE &&
    !(
      block.options?.isMultipleChoice ??
      defaultChoiceInputOptions.isMultipleChoice
    ) &&
    answer
  ) {
    const matchedItem = block.items.find(
      (item) =>
        parseVariables(variables)(item.content).normalize() ===
        answer.normalize()
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
    answer
  ) {
    const matchedItem = block.items.find(
      (item) =>
        parseVariables(variables)(item.title).normalize() === answer.normalize()
    )
    if (matchedItem?.outgoingEdgeId)
      return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true }
  }
  return { edgeId: block.outgoingEdgeId, isOffDefaultPath: false }
}
