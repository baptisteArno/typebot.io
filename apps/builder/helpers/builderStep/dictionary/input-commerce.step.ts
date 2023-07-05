import { DraggableStep, OctaStepType } from "models";
import { parseNewStep } from "services/typebots";

const templateCommerceStep = (blockId: string): Array<DraggableStep> => {
  const CommerceStep = [
    parseNewStep(OctaStepType.COMMERCE, blockId),
  ];

  return CommerceStep.reverse();
}

export { templateCommerceStep };
