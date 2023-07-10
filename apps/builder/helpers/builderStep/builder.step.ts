import { WritableDraft } from 'immer/dist/types/types-external'
import {
  Block,
  BubbleStepType,
  DraggableStep,
  DraggableStepType,
  InputStepType,
  OctaStepType,
  StepIndices,
  Typebot,
  OctaWabaStepType,
} from 'models'
import { parseNewStep } from 'services/typebots/typebots'
import { templateTextBot } from './dictionary/input-text.step'
import { templateDateBot } from './dictionary/input-date.step'
import { BuilderStepType } from './types.builder'
import { templateOfficeHours } from './dictionary/input-officeHours.step'
import { templateCommerceStep } from './dictionary/input-commerce.step'
import { templateUploadBot } from './dictionary/inputs/input-upload.step'
import { templateVariableBot } from './dictionary/variables/whatsapp-options-variable.step'
import { templateVariableButtonsBot } from './dictionary/variables/whatsapp-buttons-variable.step'

export const BuildSteps = (stepIndices: StepIndices): BuilderStepType => {
  const builder = (
    type: DraggableStepType,
    bot: WritableDraft<Typebot>,
    blockId: string
  ) => {
    let step: Array<DraggableStep>
    switch (type) {
      default:
        step = [parseNewStep(type, blockId)]
        break
    }
    return step
  }
  const apply = (
    type: DraggableStepType,
    bot: WritableDraft<Typebot>,
    blockId: string
  ): void => {
    const block: Array<WritableDraft<Block>> = bot.blocks

    const steps = builder(type, bot, blockId)

    steps.map((step) => 
      block[stepIndices.blockIndex].steps.splice(
        stepIndices.stepIndex ?? 0,
        0,
        step
      )
    )
  }
  return { apply }
}
