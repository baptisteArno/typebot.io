import {
  Step,
  Typebot,
  DraggableStep,
  DraggableStepType,
  StepIndices,
} from 'models'
import { parseNewStep } from 'services/typebots'
import { removeEmptyBlocks } from './blocks'
import { WritableDraft } from 'immer/dist/types/types-external'
import { SetTypebot } from '../TypebotContext'
import produce from 'immer'
import { cleanUpEdgeDraft, deleteEdgeDraft } from './edges'

export type StepsActions = {
  createStep: (
    blockId: string,
    step: DraggableStep | DraggableStepType,
    indices: StepIndices
  ) => void
  updateStep: (
    indices: StepIndices,
    updates: Partial<Omit<Step, 'id' | 'type'>>
  ) => void
  detachStepFromBlock: (indices: StepIndices) => void
  deleteStep: (indices: StepIndices) => void
}

const stepsAction = (
  typebot: Typebot,
  setTypebot: SetTypebot
): StepsActions => ({
  createStep: (
    blockId: string,
    step: DraggableStep | DraggableStepType,
    indices: StepIndices
  ) => {
    setTypebot(
      produce(typebot, (typebot) => {
        createStepDraft(typebot, step, blockId, indices)
      })
    )
  },
  updateStep: (
    { blockIndex, stepIndex }: StepIndices,
    updates: Partial<Omit<Step, 'id' | 'type'>>
  ) =>
    setTypebot(
      produce(typebot, (typebot) => {
        const step = typebot.blocks[blockIndex].steps[stepIndex]
        typebot.blocks[blockIndex].steps[stepIndex] = { ...step, ...updates }
      })
    ),
  detachStepFromBlock: (indices: StepIndices) => {
    setTypebot(produce(typebot, removeStepFromBlock(indices)))
  },
  deleteStep: (indices: StepIndices) => {
    setTypebot(
      produce(typebot, (typebot) => {
        removeStepFromBlock(indices)(typebot)
        removeEmptyBlocks(typebot)
      })
    )
  },
})

const removeStepFromBlock =
  ({ blockIndex, stepIndex }: StepIndices) =>
  (typebot: WritableDraft<Typebot>) => {
    const removingStep = typebot.blocks[blockIndex].steps[stepIndex]
    cleanUpEdgeDraft(typebot, removingStep.id)
    typebot.blocks[blockIndex].steps.splice(stepIndex, 1)
  }

const createStepDraft = (
  typebot: WritableDraft<Typebot>,
  step: DraggableStep | DraggableStepType,
  blockId: string,
  { blockIndex, stepIndex }: StepIndices
) => {
  const steps = typebot.blocks[blockIndex].steps
  if (
    stepIndex === steps.length &&
    stepIndex > 0 &&
    steps[stepIndex - 1].outgoingEdgeId
  )
    deleteEdgeDraft(typebot, steps[stepIndex - 1].outgoingEdgeId as string)
  typeof step === 'string'
    ? createNewStep(typebot, step, blockId, { blockIndex, stepIndex })
    : moveStepToBlock(typebot, step, blockId, { blockIndex, stepIndex })
  removeEmptyBlocks(typebot)
}

const createNewStep = (
  typebot: WritableDraft<Typebot>,
  type: DraggableStepType,
  blockId: string,
  { blockIndex, stepIndex }: StepIndices
) => {
  const newStep = parseNewStep(type, blockId)
  typebot.blocks[blockIndex].steps.splice(stepIndex ?? 0, 0, newStep)
}

const moveStepToBlock = (
  typebot: WritableDraft<Typebot>,
  step: DraggableStep,
  blockId: string,
  { blockIndex, stepIndex }: StepIndices
) =>
  typebot.blocks[blockIndex].steps.splice(stepIndex ?? 0, 0, {
    ...step,
    blockId,
  })

export { stepsAction, createStepDraft }
