import { WritableDraft } from "immer/dist/internal";
import { BubbleStepType, DraggableStep, InputStepType, OctaStepType, Typebot } from "models";
import { parseNewStep } from "services/typebots";

const templateOfficeHours = (typebot: WritableDraft<Typebot>, blockId: string): Array<DraggableStep> => {
  const OfficeHourStep = [
    parseNewStep(OctaStepType.OFFICE_HOURS, blockId),
  ];

  return OfficeHourStep.reverse();
}

export { templateOfficeHours };