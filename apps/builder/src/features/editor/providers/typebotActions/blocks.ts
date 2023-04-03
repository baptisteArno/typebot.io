import {
  Block,
  Typebot,
  DraggableBlock,
  DraggableBlockType,
  BlockIndices,
  Webhook,
} from '@typebot.io/schemas'
import { WritableDraft } from 'immer/dist/types/types-external'
import { SetTypebot } from '../TypebotProvider'
import produce from 'immer'
import { cleanUpEdgeDraft, deleteEdgeDraft } from './edges'
import { createId } from '@paralleldrive/cuid2'
import { byId, isWebhookBlock, blockHasItems } from '@typebot.io/lib'
import { duplicateItemDraft } from './items'
import { parseNewBlock } from '@/features/typebot/helpers/parseNewBlock'

export type BlocksActions = {
  createBlock: (
    groupId: string,
    block: DraggableBlock | DraggableBlockType,
    indices: BlockIndices
  ) => void
  updateBlock: (
    indices: BlockIndices,
    updates: Partial<Omit<Block, 'id' | 'type'>>
  ) => void
  duplicateBlock: (indices: BlockIndices) => void
  detachBlockFromGroup: (indices: BlockIndices) => void
  deleteBlock: (indices: BlockIndices) => void
}

export type WebhookCallBacks = {
  onWebhookBlockCreated: (data: Partial<Webhook>) => void
  onWebhookBlockDuplicated: (
    existingWebhookId: string,
    newWebhookId: string
  ) => void
}

export const blocksAction = (
  setTypebot: SetTypebot,
  { onWebhookBlockCreated, onWebhookBlockDuplicated }: WebhookCallBacks
): BlocksActions => ({
  createBlock: (
    groupId: string,
    block: DraggableBlock | DraggableBlockType,
    indices: BlockIndices
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        createBlockDraft(
          typebot,
          block,
          groupId,
          indices,
          onWebhookBlockCreated
        )
      })
    ),
  updateBlock: (
    { groupIndex, blockIndex }: BlockIndices,
    updates: Partial<Omit<Block, 'id' | 'type'>>
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[blockIndex]
        typebot.groups[groupIndex].blocks[blockIndex] = { ...block, ...updates }
      })
    ),
  duplicateBlock: ({ groupIndex, blockIndex }: BlockIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = { ...typebot.groups[groupIndex].blocks[blockIndex] }
        const newBlock = duplicateBlockDraft(block.groupId)(
          block,
          onWebhookBlockDuplicated
        )
        typebot.groups[groupIndex].blocks.splice(blockIndex + 1, 0, newBlock)
      })
    ),
  detachBlockFromGroup: (indices: BlockIndices) =>
    setTypebot((typebot) => produce(typebot, removeBlockFromGroup(indices))),
  deleteBlock: ({ groupIndex, blockIndex }: BlockIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const removingBlock = typebot.groups[groupIndex].blocks[blockIndex]
        removeBlockFromGroup({ groupIndex, blockIndex })(typebot)
        cleanUpEdgeDraft(typebot, removingBlock.id)
        removeEmptyGroups(typebot)
      })
    ),
})

const removeBlockFromGroup =
  ({ groupIndex, blockIndex }: BlockIndices) =>
  (typebot: WritableDraft<Typebot>) => {
    if (typebot.groups[groupIndex].blocks[blockIndex].type === 'start') return
    typebot.groups[groupIndex].blocks.splice(blockIndex, 1)
  }

export const createBlockDraft = (
  typebot: WritableDraft<Typebot>,
  block: DraggableBlock | DraggableBlockType,
  groupId: string,
  { groupIndex, blockIndex }: BlockIndices,
  onWebhookBlockCreated?: (data: Partial<Webhook>) => void
) => {
  const blocks = typebot.groups[groupIndex].blocks
  if (
    blockIndex === blocks.length &&
    blockIndex > 0 &&
    blocks[blockIndex - 1].outgoingEdgeId
  )
    deleteEdgeDraft(typebot, blocks[blockIndex - 1].outgoingEdgeId as string)
  typeof block === 'string'
    ? createNewBlock(
        typebot,
        block,
        groupId,
        { groupIndex, blockIndex },
        onWebhookBlockCreated
      )
    : moveBlockToGroup(typebot, block, groupId, { groupIndex, blockIndex })
  removeEmptyGroups(typebot)
}

const createNewBlock = async (
  typebot: WritableDraft<Typebot>,
  type: DraggableBlockType,
  groupId: string,
  { groupIndex, blockIndex }: BlockIndices,
  onWebhookBlockCreated?: (data: Partial<Webhook>) => void
) => {
  const newBlock = parseNewBlock(type, groupId)
  typebot.groups[groupIndex].blocks.splice(blockIndex ?? 0, 0, newBlock)
  if (onWebhookBlockCreated && 'webhookId' in newBlock && newBlock.webhookId)
    onWebhookBlockCreated({ id: newBlock.webhookId })
}

const moveBlockToGroup = (
  typebot: WritableDraft<Typebot>,
  block: DraggableBlock,
  groupId: string,
  { groupIndex, blockIndex }: BlockIndices
) => {
  const newBlock = { ...block, groupId }
  const items = blockHasItems(block) ? block.items : []
  items.forEach((item) => {
    const edgeIndex = typebot.edges.findIndex(byId(item.outgoingEdgeId))
    if (edgeIndex === -1) return
    typebot.edges[edgeIndex].from.groupId = groupId
  })
  if (block.outgoingEdgeId) {
    if (typebot.groups[groupIndex].blocks.length > blockIndex ?? 0) {
      deleteEdgeDraft(typebot, block.outgoingEdgeId)
      newBlock.outgoingEdgeId = undefined
    } else {
      const edgeIndex = typebot.edges.findIndex(byId(block.outgoingEdgeId))
      edgeIndex !== -1
        ? (typebot.edges[edgeIndex].from.groupId = groupId)
        : (newBlock.outgoingEdgeId = undefined)
    }
  }
  typebot.edges.forEach((edge) => {
    if (edge.to.blockId === block.id) {
      edge.to.groupId = groupId
    }
  })
  typebot.groups[groupIndex].blocks.splice(blockIndex ?? 0, 0, newBlock)
}

export const duplicateBlockDraft =
  (groupId: string) =>
  (
    block: Block,
    onWebhookBlockDuplicated: WebhookCallBacks['onWebhookBlockDuplicated']
  ): Block => {
    const blockId = createId()
    if (blockHasItems(block))
      return {
        ...block,
        groupId,
        id: blockId,
        items: block.items.map(duplicateItemDraft(blockId)),
        outgoingEdgeId: undefined,
      } as Block
    if (isWebhookBlock(block)) {
      const newWebhookId = createId()
      onWebhookBlockDuplicated(block.webhookId, newWebhookId)
      return {
        ...block,
        groupId,
        id: blockId,
        webhookId: newWebhookId,
        outgoingEdgeId: undefined,
      }
    }
    return {
      ...block,
      groupId,
      id: blockId,
      outgoingEdgeId: undefined,
    }
  }

export const deleteGroupDraft =
  (typebot: WritableDraft<Typebot>) => (groupIndex: number) => {
    if (typebot.groups[groupIndex].blocks.at(0)?.type === 'start') return
    cleanUpEdgeDraft(typebot, typebot.groups[groupIndex].id)
    typebot.groups.splice(groupIndex, 1)
  }

export const removeEmptyGroups = (typebot: WritableDraft<Typebot>) => {
  const emptyGroupsIndices = typebot.groups.reduce<number[]>(
    (arr, group, idx) => {
      group.blocks.length === 0 && arr.push(idx)
      return arr
    },
    []
  )
  emptyGroupsIndices.forEach(deleteGroupDraft(typebot))
}
