import { WritableDraft } from 'immer/dist/types/types-external';
import { Block, DraggableStep, DraggableStepType, InputStepType, Step, StepIndices, Typebot } from "models";
import { parseNewStep } from 'services/typebots/typebots'
import { templateMailBot } from "./dictionary/input-email.step";
import { BuilderStepType } from "./types.builder";

export const BuildSteps = (
  stepIndices: StepIndices
  ): BuilderStepType => {

    const builder = (type: DraggableStepType, bot: WritableDraft<Typebot>, blockId: string) => {
      let step: Array<DraggableStep>;
      switch (type) {
        case InputStepType.EMAIL:
          step = templateMailBot(bot, blockId)
          break;
        default:
          step = [parseNewStep(type, blockId)]
          break;
      }
      return step;
    }

    const apply = (type: DraggableStepType, bot: WritableDraft<Typebot>, blockId: string): void => {
      const block: Array<WritableDraft<Block>> = bot.blocks
      const steps = builder(type, bot, blockId);
      steps.map(step => (
        block[stepIndices.blockIndex].steps.splice( stepIndices.stepIndex ?? 0, 0, step)
      ));
    }

    return { apply }
  }
