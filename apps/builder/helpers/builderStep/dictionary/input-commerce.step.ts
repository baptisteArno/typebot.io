import { DraggableStep, OctaWabaStepType } from "models";
import { parseNewStep } from "services/typebots";

const templateCommerceStep = (blockId: string): Array<DraggableStep> => {
  const CommerceStep = [
    parseNewStep(OctaWabaStepType.COMMERCE, blockId),
  ];

  return CommerceStep.reverse();
}

export { templateCommerceStep };
