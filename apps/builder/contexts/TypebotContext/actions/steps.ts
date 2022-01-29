import {
  ChoiceInputStep,
  Step,
  Typebot,
  DraggableStep,
  DraggableStepType,
} from 'models'
import { parseNewStep } from 'services/typebots'
import { Updater } from 'use-immer'
import { removeEmptyBlocks } from './blocks'
import { WritableDraft } from 'immer/dist/types/types-external'
import { createChoiceItemDraft, deleteChoiceItemDraft } from './choiceItems'
import { isChoiceInput, isWebhookStep } from 'utils'
import { deleteEdgeDraft } from './edges'
import { deleteWebhookDraft } from './webhooks'

export type StepsActions = {
  createStep: (
    blockId: string,
    step?: DraggableStep | DraggableStepType,
    index?: number
  ) => void
  updateStep: (
    stepId: string,
    updates: Partial<Omit<Step, 'id' | 'type'>>
  ) => void
  detachStepFromBlock: (stepId: string) => void
  deleteStep: (stepId: string) => void
}

export const stepsAction = (setTypebot: Updater<Typebot>): StepsActions => ({
  createStep: (
    blockId: string,
    step?: DraggableStep | DraggableStepType,
    index?: number
  ) => {
    if (!step) return
    setTypebot((typebot) => {
      createStepDraft(typebot, step, blockId, index)
      removeEmptyBlocks(typebot)
    })
  },
  updateStep: (stepId: string, updates: Partial<Omit<Step, 'id' | 'type'>>) =>
    setTypebot((typebot) => {
      typebot.steps.byId[stepId] = { ...typebot.steps.byId[stepId], ...updates }
    }),
  detachStepFromBlock: (stepId: string) => {
    setTypebot((typebot) => {
      removeStepIdFromBlock(typebot, stepId)
    })
  },
  deleteStep: (stepId: string) => {
    setTypebot((typebot) => {
      const step = typebot.steps.byId[stepId]
      if (isChoiceInput(step)) deleteChoiceItemsInsideStep(typebot, step)
      if (isWebhookStep(step))
        deleteWebhookDraft(step.options?.webhookId)(typebot)
      deleteEdgeDraft(typebot, step.edgeId)
      removeStepIdFromBlock(typebot, stepId)
      deleteStepDraft(typebot, stepId)
    })
  },
})

const removeStepIdFromBlock = (
  typebot: WritableDraft<Typebot>,
  stepId: string
) => {
  const containerBlock = typebot.blocks.byId[typebot.steps.byId[stepId].blockId]
  containerBlock.stepIds.splice(containerBlock.stepIds.indexOf(stepId), 1)
}

export const deleteStepDraft = (
  typebot: WritableDraft<Typebot>,
  stepId: string
) => {
  delete typebot.steps.byId[stepId]
  const index = typebot.steps.allIds.indexOf(stepId)
  if (index !== -1) typebot.steps.allIds.splice(index, 1)
}

export const createStepDraft = (
  typebot: WritableDraft<Typebot>,
  step: DraggableStep | DraggableStepType,
  blockId: string,
  index?: number
) =>
  typeof step === 'string'
    ? createNewStep(typebot, step, blockId, index)
    : moveStepToBlock(typebot, step, blockId, index)

const createNewStep = (
  typebot: WritableDraft<Typebot>,
  type: DraggableStepType,
  blockId: string,
  index?: number
) => {
  const newStep = parseNewStep(type, blockId)
  typebot.steps.byId[newStep.id] = newStep
  if (isChoiceInput(newStep))
    createChoiceItemDraft(typebot, { stepId: newStep.id })
  typebot.steps.allIds.push(newStep.id)
  typebot.blocks.byId[blockId].stepIds.splice(index ?? 0, 0, newStep.id)
}

const moveStepToBlock = (
  typebot: WritableDraft<Typebot>,
  step: DraggableStep,
  blockId: string,
  index?: number
) => typebot.blocks.byId[blockId].stepIds.splice(index ?? 0, 0, step.id)

const deleteChoiceItemsInsideStep = (
  typebot: WritableDraft<Typebot>,
  step: ChoiceInputStep
) =>
  step.options?.itemIds.forEach((itemId) =>
    deleteChoiceItemDraft(typebot, itemId)
  )
