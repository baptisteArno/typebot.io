import {
  Step,
  Typebot,
  DraggableStep,
  DraggableStepType,
  StepIndices,
  IntegrationStepType,
} from 'models'
import { parseNewStep } from 'services/typebots/typebots'
import { removeEmptyBlocks } from './blocks'
import { WritableDraft } from 'immer/dist/types/types-external'
import { SetTypebot } from '../TypebotContext'
import produce from 'immer'
import { cleanUpEdgeDraft, deleteEdgeDraft } from './edges'
import cuid from 'cuid'

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
  duplicateStep: (indices: StepIndices) => void
  detachStepFromBlock: (indices: StepIndices) => void
  deleteStep: (indices: StepIndices) => void
}

const stepsAction = (setTypebot: SetTypebot): StepsActions => ({
  createStep: (
    blockId: string,
    step: DraggableStep | DraggableStepType,
    indices: StepIndices
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        createStepDraft(typebot, step, blockId, indices)
      })
    ),
  updateStep: (
    { blockIndex, stepIndex }: StepIndices,
    updates: Partial<Omit<Step, 'id' | 'type'>>
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const step = typebot.blocks[blockIndex].steps[stepIndex]
        typebot.blocks[blockIndex].steps[stepIndex] = { ...step, ...updates }
      })
    ),
  duplicateStep: ({ blockIndex, stepIndex }: StepIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const step = typebot.blocks[blockIndex].steps[stepIndex]
        const id = cuid()
        const newStep: Step =
          step.type === IntegrationStepType.WEBHOOK
            ? {
                ...step,
                id,
                webhookId: cuid(),
              }
            : {
                ...step,
                id,
              }
        typebot.blocks[blockIndex].steps.splice(stepIndex + 1, 0, newStep)
      })
    ),
  detachStepFromBlock: (indices: StepIndices) =>
    setTypebot((typebot) => produce(typebot, removeStepFromBlock(indices))),
  deleteStep: ({ blockIndex, stepIndex }: StepIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        removeStepFromBlock({ blockIndex, stepIndex })(typebot)
        removeEmptyBlocks(typebot)
      })
    ),
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

const createNewStep = async (
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
    outgoingEdgeId: undefined,
  })

export { stepsAction, createStepDraft }
