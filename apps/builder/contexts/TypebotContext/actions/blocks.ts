import { Coordinates } from 'contexts/GraphContext'
import { Block, Step, StepType, Typebot } from 'models'
import { parseNewBlock } from 'services/typebots'
import { Updater } from 'use-immer'
import { createStepDraft, deleteStepDraft } from './steps'

export type BlocksActions = {
  createBlock: (props: Coordinates & { step: StepType | Step }) => void
  updateBlock: (blockId: string, updates: Partial<Omit<Block, 'id'>>) => void
  deleteBlock: (blockId: string) => void
}

export const blocksActions = (setTypebot: Updater<Typebot>): BlocksActions => ({
  createBlock: ({ x, y, step }: Coordinates & { step: StepType | Step }) => {
    setTypebot((typebot) => {
      const newBlock = parseNewBlock({
        totalBlocks: typebot.blocks.allIds.length,
        initialCoordinates: { x, y },
      })
      typebot.blocks.byId[newBlock.id] = newBlock
      typebot.blocks.allIds.push(newBlock.id)
      createStepDraft(typebot, step, newBlock.id)
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
      const block = typebot.blocks.byId[blockId]
      block.stepIds.forEach((stepId) => deleteStepDraft(typebot, stepId))
      delete typebot.blocks.byId[blockId]
      const index = typebot.blocks.allIds.indexOf(blockId)
      if (index !== -1) typebot.blocks.allIds.splice(index, 1)
    }),
})
