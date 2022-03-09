import { Coordinates } from 'contexts/GraphContext'
import { produce } from 'immer'
import { WritableDraft } from 'immer/dist/internal'
import {
  Block,
  DraggableStep,
  DraggableStepType,
  StepIndices,
  Typebot,
} from 'models'
import { SetTypebot } from '../TypebotContext'
import { cleanUpEdgeDraft } from './edges'
import { createStepDraft } from './steps'

export type BlocksActions = {
  createBlock: (
    props: Coordinates & {
      id: string
      step: DraggableStep | DraggableStepType
      indices: StepIndices
    }
  ) => void
  updateBlock: (blockIndex: number, updates: Partial<Omit<Block, 'id'>>) => void
  deleteBlock: (blockIndex: number) => void
}

const blocksActions = (setTypebot: SetTypebot): BlocksActions => ({
  createBlock: ({
    id,
    step,
    indices,
    ...graphCoordinates
  }: Coordinates & {
    id: string
    step: DraggableStep | DraggableStepType
    indices: StepIndices
  }) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newBlock: Block = {
          id,
          graphCoordinates,
          title: `Block #${typebot.blocks.length}`,
          steps: [],
        }
        typebot.blocks.push(newBlock)
        createStepDraft(typebot, step, newBlock.id, indices)
      })
    ),
  updateBlock: (blockIndex: number, updates: Partial<Omit<Block, 'id'>>) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.blocks[blockIndex]
        typebot.blocks[blockIndex] = { ...block, ...updates }
      })
    ),

  deleteBlock: (blockIndex: number) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteBlockDraft(typebot)(blockIndex)
      })
    ),
})

const deleteBlockDraft =
  (typebot: WritableDraft<Typebot>) => (blockIndex: number) => {
    cleanUpEdgeDraft(typebot, typebot.blocks[blockIndex].id)
    typebot.blocks.splice(blockIndex, 1)
  }

const removeEmptyBlocks = (typebot: WritableDraft<Typebot>) => {
  const emptyBlocksIndices = typebot.blocks.reduce<number[]>(
    (arr, block, idx) => {
      block.steps.length === 0 && arr.push(idx)
      return arr
    },
    []
  )
  emptyBlocksIndices.forEach(deleteBlockDraft(typebot))
}

export { blocksActions, removeEmptyBlocks }
