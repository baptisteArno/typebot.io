import { Coordinates } from 'contexts/GraphContext'
import cuid from 'cuid'
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
import { createStepDraft, duplicateStepDraft } from './steps'
import { updateBlocksHasConnections } from 'helpers/block-connections'

export type BlocksActions = {
  createBlock: (
    props: Coordinates & {
      id: string
      step: DraggableStep | DraggableStepType
      indices: StepIndices
    }
  ) => void
  updateBlock: (blockIndex: number, updates: Partial<Omit<Block, 'id'>>) => void
  duplicateBlock: (blockIndex: number) => void
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
          title: `Grupo #${typebot?.blocks?.length || '1'}`,
          steps: [],
          hasConnection: false,
        }

        typebot.blocks.push(newBlock)

        typebot.blocks = updateBlocksHasConnections(typebot)

        createStepDraft(typebot, step, newBlock.id, indices)
      })
    ),
  updateBlock: (blockIndex: number, updates: Partial<Omit<Block, 'id'>>) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.blocks[blockIndex]

        typebot.blocks[blockIndex] = { ...block, ...updates }

        typebot.blocks = updateBlocksHasConnections(typebot)
      })
    )
  },
  duplicateBlock: (blockIndex: number) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.blocks[blockIndex]

        const id = cuid()

        const newBlock: Block = {
          ...block,
          title: `${block.title} copy`,
          id,
          steps: block.steps.map(duplicateStepDraft(id)),
          graphCoordinates: {
            x: block.graphCoordinates.x + 200,
            y: block.graphCoordinates.y + 100,
          },
          hasConnection: false,
        }

        typebot.blocks.splice(blockIndex + 1, 0, newBlock)
      })
    )
  },
  deleteBlock: (blockIndex: number) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteBlockDraft(typebot)(blockIndex)

        typebot.blocks = updateBlocksHasConnections(typebot)
      })
    )
  },
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
