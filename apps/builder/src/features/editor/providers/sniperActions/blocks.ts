import {
  Block,
  Sniper,
  BlockIndices,
  HttpRequest,
  BlockV6,
  SniperV6,
} from '@sniper.io/schemas'
import { SetSniper } from '../SniperProvider'
import { produce, Draft } from 'immer'
import { deleteConnectedEdgesDraft, deleteEdgeDraft } from './edges'
import { createId } from '@paralleldrive/cuid2'
import { byId } from '@sniper.io/lib'
import { blockHasItems } from '@sniper.io/schemas/helpers'
import { duplicateItemDraft } from './items'
import { parseNewBlock } from '@/features/sniper/helpers/parseNewBlock'

export type BlocksActions = {
  createBlock: (
    block: BlockV6 | BlockV6['type'],
    indices: BlockIndices
  ) => string | undefined
  updateBlock: (
    indices: BlockIndices,
    updates: Partial<Omit<BlockV6, 'id' | 'type'>>
  ) => void
  duplicateBlock: (indices: BlockIndices) => void
  detachBlockFromGroup: (indices: BlockIndices) => void
  deleteBlock: (indices: BlockIndices) => void
}

export type WebhookCallBacks = {
  onWebhookBlockCreated: (data: Partial<HttpRequest>) => void
  onWebhookBlockDuplicated: (
    existingWebhookId: string,
    newWebhookId: string
  ) => void
}

export const blocksAction = (setSniper: SetSniper): BlocksActions => ({
  createBlock: (block: BlockV6 | BlockV6['type'], indices: BlockIndices) => {
    let blockId
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        blockId = createBlockDraft(sniper, block, indices)
      })
    )
    return blockId
  },
  updateBlock: (
    { groupIndex, blockIndex }: BlockIndices,
    updates: Partial<Omit<Block, 'id' | 'type'>>
  ) =>
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        if (!sniper.groups[groupIndex]?.blocks[blockIndex]) return
        const block = sniper.groups[groupIndex].blocks[blockIndex]
        sniper.groups[groupIndex].blocks[blockIndex] = { ...block, ...updates }
      })
    ),
  duplicateBlock: ({ groupIndex, blockIndex }: BlockIndices) =>
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        const block = { ...sniper.groups[groupIndex].blocks[blockIndex] }
        const blocks = sniper.groups[groupIndex].blocks
        if (blockIndex === blocks.length - 1 && block.outgoingEdgeId)
          deleteEdgeDraft({ sniper, edgeId: block.outgoingEdgeId })
        const newBlock = duplicateBlockDraft(block)
        sniper.groups[groupIndex].blocks.splice(blockIndex + 1, 0, newBlock)
      })
    ),
  detachBlockFromGroup: (indices: BlockIndices) =>
    setSniper((sniper) => produce(sniper, removeBlockFromGroup(indices))),
  deleteBlock: ({ groupIndex, blockIndex }: BlockIndices) =>
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        const removingBlock = sniper.groups[groupIndex].blocks[blockIndex]
        deleteConnectedEdgesDraft(sniper, removingBlock.id)
        removeBlockFromGroup({ groupIndex, blockIndex })(sniper)
        removeEmptyGroups(sniper)
      })
    ),
})

const removeBlockFromGroup =
  ({ groupIndex, blockIndex }: BlockIndices) =>
  (sniper: Draft<SniperV6>) => {
    sniper.groups[groupIndex].blocks.splice(blockIndex, 1)
  }

export const createBlockDraft = (
  sniper: Draft<SniperV6>,
  block: BlockV6 | BlockV6['type'],
  { groupIndex, blockIndex }: BlockIndices
) => {
  const blocks = sniper.groups[groupIndex].blocks
  if (
    blockIndex === blocks.length &&
    blockIndex > 0 &&
    blocks[blockIndex - 1].outgoingEdgeId
  )
    deleteEdgeDraft({
      sniper,
      edgeId: blocks[blockIndex - 1].outgoingEdgeId as string,
      groupIndex,
    })
  const blockId =
    typeof block === 'string'
      ? createNewBlock(sniper, block, { groupIndex, blockIndex })
      : moveBlockToGroup(sniper, block, { groupIndex, blockIndex })
  removeEmptyGroups(sniper)
  return blockId
}

const createNewBlock = (
  sniper: Draft<Sniper>,
  type: BlockV6['type'],
  { groupIndex, blockIndex }: BlockIndices
) => {
  const newBlock = parseNewBlock(type)
  sniper.groups[groupIndex].blocks.splice(blockIndex ?? 0, 0, newBlock)
  return newBlock.id
}

const moveBlockToGroup = (
  sniper: Draft<SniperV6>,
  block: BlockV6,
  { groupIndex, blockIndex }: BlockIndices
) => {
  const newBlock = { ...block }
  if (block.outgoingEdgeId) {
    if (sniper.groups[groupIndex].blocks.length > blockIndex ?? 0) {
      deleteEdgeDraft({ sniper, edgeId: block.outgoingEdgeId, groupIndex })
      newBlock.outgoingEdgeId = undefined
    } else {
      const edgeIndex = sniper.edges.findIndex(byId(block.outgoingEdgeId))
      if (edgeIndex === -1) newBlock.outgoingEdgeId = undefined
    }
  }
  const groupId = sniper.groups[groupIndex].id
  sniper.edges.forEach((edge) => {
    if (edge.to.blockId === block.id) {
      edge.to.groupId = groupId
    }
  })
  sniper.groups[groupIndex].blocks.splice(blockIndex ?? 0, 0, newBlock)
}

export const duplicateBlockDraft = (block: BlockV6): BlockV6 => {
  const blockId = createId()
  if (blockHasItems(block))
    return {
      ...block,
      id: blockId,
      items: block.items?.map(duplicateItemDraft(blockId)),
      outgoingEdgeId: undefined,
    } as BlockV6
  return {
    ...block,
    id: blockId,
    outgoingEdgeId: undefined,
  }
}

export const deleteGroupDraft =
  (sniper: Draft<SniperV6>) => (groupIndex: number) => {
    deleteConnectedEdgesDraft(sniper, sniper.groups[groupIndex].id)
    sniper.groups.splice(groupIndex, 1)
  }

export const removeEmptyGroups = (sniper: Draft<SniperV6>) => {
  const emptyGroupsIndices = sniper.groups.reduce<number[]>(
    (arr, group, idx) => {
      group.blocks.length === 0 && arr.push(idx)
      return arr
    },
    []
  )
  emptyGroupsIndices.forEach(deleteGroupDraft(sniper))
}
