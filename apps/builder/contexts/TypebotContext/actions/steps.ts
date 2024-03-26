import {
  Step,
  Typebot,
  DraggableStep,
  DraggableStepType,
  StepIndices,
} from 'models'
import { removeEmptyBlocks } from './blocks'
import { WritableDraft } from 'immer/dist/types/types-external'
import { SetEmptyFields, SetTypebot } from '../TypebotContext'
import produce from 'immer'
import { cleanUpEdgeDraft, deleteEdgeDraft } from './edges'
import cuid from 'cuid'
import { byId, isWebhookStep, stepHasItems } from 'utils'
import { duplicateItemDraft } from './items'
import { BuildSteps } from 'helpers/builderStep/builder.step'
import { ActionsTypeEmptyFields } from 'services/utils/useEmptyFields'

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

const stepsAction = (
  setTypebot: SetTypebot,
  setEmptyFields: SetEmptyFields
): StepsActions => ({
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
        const step = { ...typebot.blocks[blockIndex].steps[stepIndex] }
        const newStep = duplicateStepDraft(step.blockId)(step)
        typebot.blocks[blockIndex].steps.splice(stepIndex + 1, 0, newStep)
      })
    ),
  detachStepFromBlock: (indices: StepIndices) =>
    setTypebot((typebot) => produce(typebot, removeStepFromBlock(indices))),
  deleteStep: ({ blockIndex, stepIndex }: StepIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const stepId = typebot.blocks[blockIndex].steps[stepIndex].id
        setEmptyFields([stepId], ActionsTypeEmptyFields.REMOVE)

        const removingStep = typebot.blocks[blockIndex].steps[stepIndex]
        removeStepFromBlock({ blockIndex, stepIndex })(typebot)
        cleanUpEdgeDraft(typebot, removingStep.id)
        removeEmptyBlocks(typebot)
      })
    ),
})

const removeStepFromBlock =
  ({ blockIndex, stepIndex }: StepIndices) =>
  (typebot: WritableDraft<Typebot>) => {
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
  BuildSteps({ blockIndex, stepIndex }).apply(type, typebot, blockId)
  // const newStep = parseNewStep(type, blockId)
  // typebot.blocks[blockIndex].steps.splice(stepIndex ?? 0, 0, newStep)
}

const moveStepToBlock = (
  typebot: WritableDraft<Typebot>,
  step: DraggableStep,
  blockId: string,
  { blockIndex, stepIndex }: StepIndices
) => {
  const newStep = { ...step, blockId }
  const items = stepHasItems(step) ? step.items : []
  items.forEach((item) => {
    const edgeIndex = typebot.edges.findIndex(byId(item.outgoingEdgeId))
    if (edgeIndex === -1) return
    typebot.edges[edgeIndex].from.blockId = blockId
  })
  if (step.outgoingEdgeId) {
    if (typebot.blocks[blockIndex].steps.length > stepIndex ?? 0) {
      deleteEdgeDraft(typebot, step.outgoingEdgeId)
      newStep.outgoingEdgeId = undefined
    } else {
      const edgeIndex = typebot.edges.findIndex(byId(step.outgoingEdgeId))
      edgeIndex !== -1
        ? (typebot.edges[edgeIndex].from.blockId = blockId)
        : (newStep.outgoingEdgeId = undefined)
    }
  }
  typebot.blocks[blockIndex].steps.splice(stepIndex ?? 0, 0, newStep)
}

const duplicateStepDraft =
  (blockId: string) =>
  (step: Step): Step => {
    const stepId = cuid()
    return {
      ...step,
      blockId,
      id: stepId,
      items: stepHasItems(step)
        ? step.items.map(duplicateItemDraft(stepId))
        : undefined,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      webhookId: isWebhookStep(step) ? cuid() : undefined,
      outgoingEdgeId: undefined,
    }
  }

export { stepsAction, createStepDraft, duplicateStepDraft }
