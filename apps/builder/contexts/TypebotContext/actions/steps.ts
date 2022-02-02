import {
  ChoiceInputStep,
  Step,
  Typebot,
  DraggableStep,
  DraggableStepType,
  defaultWebhookAttributes,
} from 'models'
import { parseNewStep } from 'services/typebots'
import { removeEmptyBlocks } from './blocks'
import { WritableDraft } from 'immer/dist/types/types-external'
import { createChoiceItemDraft, deleteChoiceItemDraft } from './choiceItems'
import { isChoiceInput, isWebhookStep } from 'utils'
import { deleteEdgeDraft } from './edges'
import { createWebhookDraft, deleteWebhookDraft } from './webhooks'
import { SetTypebot } from '../TypebotContext'
import produce from 'immer'

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

export const stepsAction = (
  typebot: Typebot,
  setTypebot: SetTypebot
): StepsActions => ({
  createStep: (
    blockId: string,
    step?: DraggableStep | DraggableStepType,
    index?: number
  ) => {
    if (!step) return
    setTypebot(
      produce(typebot, (typebot) => {
        createStepDraft(typebot, step, blockId, index)
        removeEmptyBlocks(typebot)
      })
    )
  },
  updateStep: (stepId: string, updates: Partial<Omit<Step, 'id' | 'type'>>) =>
    setTypebot(
      produce(typebot, (typebot) => {
        typebot.steps.byId[stepId] = {
          ...typebot.steps.byId[stepId],
          ...updates,
        }
      })
    ),
  detachStepFromBlock: (stepId: string) => {
    setTypebot(
      produce(typebot, (typebot) => {
        removeStepIdFromBlock(typebot, stepId)
      })
    )
  },
  deleteStep: (stepId: string) => {
    setTypebot(produce(typebot, deleteStepDraft(stepId)))
  },
})

const removeStepIdFromBlock = (
  typebot: WritableDraft<Typebot>,
  stepId: string
) => {
  const containerBlock = typebot.blocks.byId[typebot.steps.byId[stepId].blockId]
  containerBlock.stepIds.splice(containerBlock.stepIds.indexOf(stepId), 1)
}

export const deleteStepDraft =
  (stepId: string) => (typebot: WritableDraft<Typebot>) => {
    const step = typebot.steps.byId[stepId]
    if (isChoiceInput(step)) deleteChoiceItemsInsideStep(typebot, step)
    if (isWebhookStep(step))
      deleteWebhookDraft(step.options?.webhookId)(typebot)
    deleteEdgeDraft(typebot, step.edgeId)
    removeStepIdFromBlock(typebot, stepId)
    delete typebot.steps.byId[stepId]
    const index = typebot.steps.allIds.indexOf(stepId)
    if (index !== -1) typebot.steps.allIds.splice(index, 1)
    removeEmptyBlocks(typebot)
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
  if (isChoiceInput(newStep)) {
    createChoiceItemDraft(typebot, {
      id: newStep.options.itemIds[0],
      stepId: newStep.id,
    })
  } else if (isWebhookStep(newStep)) {
    createWebhookDraft({
      id: newStep.options.webhookId,
      ...defaultWebhookAttributes,
    })(typebot)
  }
  typebot.steps.allIds.push(newStep.id)
  typebot.blocks.byId[blockId].stepIds.splice(index ?? 0, 0, newStep.id)
}

const moveStepToBlock = (
  typebot: WritableDraft<Typebot>,
  step: DraggableStep,
  blockId: string,
  index?: number
) => {
  typebot.steps.byId[step.id].blockId = blockId
  typebot.blocks.byId[blockId].stepIds.splice(index ?? 0, 0, step.id)
}

const deleteChoiceItemsInsideStep = (
  typebot: WritableDraft<Typebot>,
  step: ChoiceInputStep
) =>
  step.options?.itemIds.forEach((itemId) =>
    deleteChoiceItemDraft(typebot, itemId)
  )
