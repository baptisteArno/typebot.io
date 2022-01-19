import { Coordinates } from 'contexts/GraphContext'
import { WritableDraft } from 'immer/dist/internal'
import { Block, DraggableStep, DraggableStepType, Typebot } from 'models'
import { parseNewBlock } from 'services/typebots'
import { Updater } from 'use-immer'
import { deleteEdgeDraft } from './edges'
import { createStepDraft, deleteStepDraft } from './steps'

export type BlocksActions = {
  createBlock: (
    props: Coordinates & {
      step: DraggableStep | DraggableStepType
    }
  ) => void
  updateBlock: (blockId: string, updates: Partial<Omit<Block, 'id'>>) => void
  deleteBlock: (blockId: string) => void
}

export const blocksActions = (setTypebot: Updater<Typebot>): BlocksActions => ({
  createBlock: ({
    x,
    y,
    step,
  }: Coordinates & {
    step: DraggableStep | DraggableStepType
  }) => {
    setTypebot((typebot) => {
      const newBlock = parseNewBlock({
        totalBlocks: typebot.blocks.allIds.length,
        initialCoordinates: { x, y },
      })
      typebot.blocks.byId[newBlock.id] = newBlock
      typebot.blocks.allIds.push(newBlock.id)
      createStepDraft(typebot, step, newBlock.id)
      removeEmptyBlocks(typebot)
    })
  },
  updateBlock: (blockId: string, updates: Partial<Omit<Block, 'id'>>) =>
    setTypebot((typebot) => {
      typebot.blocks.byId[blockId] = {
        ...typebot.blocks.byId[blockId],
        ...updates,
      }
    }),
  deleteBlock: (blockId: string) =>
    setTypebot((typebot) => {
      deleteStepsInsideBlock(typebot, blockId)
      deleteAssociatedEdges(typebot, blockId)
      deleteBlockDraft(typebot)(blockId)
    }),
})

export const removeEmptyBlocks = (typebot: WritableDraft<Typebot>) => {
  const emptyBlockIds = typebot.blocks.allIds.filter(
    (blockId) => typebot.blocks.byId[blockId].stepIds.length === 0
  )
  emptyBlockIds.forEach(deleteBlockDraft(typebot))
}

const deleteAssociatedEdges = (
  typebot: WritableDraft<Typebot>,
  blockId: string
) => {
  typebot.edges.allIds.forEach((edgeId) => {
    if (typebot.edges.byId[edgeId].to.blockId === blockId)
      deleteEdgeDraft(typebot, edgeId)
  })
}

const deleteStepsInsideBlock = (
  typebot: WritableDraft<Typebot>,
  blockId: string
) => {
  const block = typebot.blocks.byId[blockId]
  block.stepIds.forEach((stepId) => deleteStepDraft(typebot, stepId))
}

export const deleteBlockDraft =
  (typebot: WritableDraft<Typebot>) => (blockId: string) => {
    delete typebot.blocks.byId[blockId]
    const index = typebot.blocks.allIds.indexOf(blockId)
    if (index !== -1) typebot.blocks.allIds.splice(index, 1)
  }
